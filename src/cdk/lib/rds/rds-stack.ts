import * as cdk from 'aws-cdk-lib'
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from 'aws-cdk-lib/aws-ec2'
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from 'aws-cdk-lib/aws-rds'
import {Secret} from 'aws-cdk-lib/aws-secretsmanager'
import {StringParameter} from 'aws-cdk-lib/aws-ssm'
import {Construct} from 'constructs'

export interface RDSStackProps extends cdk.StackProps {
  vpc: Vpc
}

export class RdsStack extends cdk.Stack {
  readonly postgresQLInstance: DatabaseInstance
  readonly credentials: {username: string, password: string}
  readonly password: string
  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props)

    const vpc = props.vpc

    const dbSecurityGroup = new SecurityGroup(this, 'SkoposDBSecurityGroup', {
      vpc
    })
    dbSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(5432))

    const databaseCredentialsSecret = new Secret(this, `skoposDBCredentialsSecret`, {
      secretName: `skoposDBCredentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    })

    const username = databaseCredentialsSecret.secretValueFromJson('username').unsafeUnwrap()
    const password = databaseCredentialsSecret.secretValueFromJson('password').unsafeUnwrap()
    this.credentials = {username, password}
    // next, create a new string parameter to be used
    new StringParameter(this, 'DBCredentialsArn', {
      parameterName: `skoposDBCredentialsARN`,
      stringValue: databaseCredentialsSecret.secretArn,
    });

    this.postgresQLInstance = new DatabaseInstance(this, 'skopos-db', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_7,
      }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      credentials: Credentials.fromSecret(databaseCredentialsSecret),
      vpc,
      vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED,},
      maxAllocatedStorage: 200,
      allowMajorVersionUpgrade: false,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: 'prisma',
      publiclyAccessible: true,
      securityGroups: [dbSecurityGroup]
    })
  }
}
