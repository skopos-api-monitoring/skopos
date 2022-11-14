import React from 'react'
import {Button} from 'react-daisyui'
import {BiTrash} from 'react-icons/bi'
import HeaderForm from './HeaderForm'

interface HeaderListProps {
  headers: Record<string, string>
  setHeaders: (header: Record<string, string>) => void
}

export default function HeaderList({headers, setHeaders}: HeaderListProps) {
  const handleClickDelete = (key: string) => {
    let headerCopy = {...headers}
    delete headerCopy[key]
    setHeaders(headerCopy)
  }

  return (
    <div>
      <ul>
      {Object.keys(headers).map(key => (
        <li className='my-1 flex gap-2 pr-6' key={Math.random().toString().slice(2)}>
          <span className='text-primary'>{key}: {headers[key]}</span>
         <Button color='ghost' size='xs' type="button" onClick={() => handleClickDelete(key)}>
           <BiTrash className='text-lg text-error'/>
         </Button>
        </li>
      ))}
      </ul>
      <HeaderForm headers={headers} setHeaders={setHeaders}/>
    </div>
  )
}