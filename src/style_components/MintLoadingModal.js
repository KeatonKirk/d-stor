import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {FallingLines} from 'react-loader-spinner';

export default function LoadingModal(props) {
  const [open, setOpen] = useState(true)

  const cancelButtonRef = useRef(null)

	useEffect(() => {
		if (!open) {
			setOpen(true)
		}
	
	}, [open])
	

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-center  items-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="flex flex-col mt-3 text-center items-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Your Access NFT is Minting!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm font-bold text-gray-500">
                          *Please confirm the NFT mint transaction in your wallet*
                        </p> <br/>
												<p className="text-sm text-gray-500">
                          This may take a minute or so while we confirm the transaction on chain, but you only have to do this ONCE!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
								<div className=" flex flex-col items-center">
								<FallingLines
									color="#00BFFF"
									className=""/>
							</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
