import Loader from "components/Loader";
import AddMonitor from 'components/monitors/AddMonitor'
import {GetMonitors} from 'graphql/queries'
import { Table } from "react-daisyui";
import { ReactComponent as MonitorSVG } from "assets/undraw_surveillance_re_8tkl.svg";
import MonitorListItem from "components/MonitorListItem";
import { useToast } from "hooks/ToastProvider";
import {useEffect} from 'react'
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {Monitor} from 'types'

export default function Monitors() {
  const { data, error, loading } = useQuery<{ monitors: Monitor[] }>(GetMonitors, {
    variables: {
      where: {
        monitorId: {
          not: null
        }
      }
    }
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (error) addToast(error.message, "error");
  }, [error, addToast]);

  if (loading) return <Loader/>

  if (data?.monitors.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-2xl font-medium">Monitors</h2>
        <Link to='new' className='btn bg-sky-blue ml-auto'>Add Monitor</Link>
        <div className='self-center'>
          <MonitorSVG className="w-full max-w-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className='grid place-items-center min-w-[768px] overflow-x-auto'>
      <AddMonitor/>
      <Table compact>
        <Table.Head className='text-center'>
          <span>Schedule</span>
          <span>On Error Contact</span>
          <span>Collections</span>
          <span>Actions</span>
        </Table.Head>
        <Table.Body>
          {data?.monitors.map(monitor => (<MonitorListItem key={monitor.id} {...monitor}/>))}
        </Table.Body>
      </Table>
    </div>
  );
}