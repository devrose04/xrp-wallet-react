import { useEffect, useState } from "react";
import crossMarkWalletSDK from "@crossmarkio/sdk"
import * as gemWalletAPI from "@gemwallet/api"
import { Xumm } from "xumm"

import { CROSS_MARK_WALLET_CONNECT, GEM_WALLET_CONNECT, XAMAN_WALLET_CONNECT, } from "@/constants/types";
import MainLayout from "@/components/ui/layout/MainLayout";
import WalletConnect from "@/components/ui/WalletConnector/WalletConnect";

const xumm = new Xumm(import.meta.env.VITE_XUMM_API_KEY || "");

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("0")
  const [destination, setDestination] = useState<string>("")
  const [connectedWallet, setConnectedWallet] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)
  const [qrcode, setQrCode] = useState<string>("")
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(false);
    }
    return (() => {
      xumm.logout()
    })
  }, [])

  const handleConnnectGemWallet = () => {
    try {
      gemWalletAPI.isInstalled().then((connectResult) => {
        const { result } = connectResult
        if (result.isInstalled) {
          gemWalletAPI.getAddress().then((addressResult) => {
            const { result } = addressResult
            if (result?.address) {
              console.log(`Your address: `, result?.address);
              setWalletAddress(result.address)
              setConnectedWallet(GEM_WALLET_CONNECT)
            } else {
              console.log(`Your address: `, result?.address);
            }
          });
        }
      })
    } catch (err) {
      console.log(`Err : `, err)
    }
  }

  const handleCrossMarkWallet = async () => {
    try {
      const isInstalled = crossMarkWalletSDK.sync.isConnected();
      if (isInstalled) {
        let id = crossMarkWalletSDK.sync.signIn();
        const res = crossMarkWalletSDK.sync.getResponse(id)
        const address = crossMarkWalletSDK.sync.getAddress()
        console.log(res)
        if (address) {
          setWalletAddress(address)
          setConnectedWallet(CROSS_MARK_WALLET_CONNECT)
        }
      } else {

      }
    } catch (err) {

    }
  }

  const handleConnectXummWallet = async () => {
    try {
      xumm.user.account.then(a => {
        if (a) {
          setWalletAddress(a)
          setConnectedWallet(XAMAN_WALLET_CONNECT)
        }
      })
      xumm.authorize().then((res) => {
        console.log(res)
      })
    } catch (err) {
      console.log(`Err : `, err)
    }
  }

  const sendPaymentWithGemWallet = async () => {
    try {
      const payment = {
        amount,
        destination
      }
      const paymentRes = await gemWalletAPI.sendPayment(payment)
      return paymentRes
    } catch (err) {
      console.log(`Err `, err)
    }
  }

  const sendPaymentWithCrossMarkWallet = async () => {
    try {
      const id = crossMarkWalletSDK.sync.sign({
        TransactionType: "Payment",
        Account: walletAddress,
        Destination: destination,
        Amount: amount
      })
      const res = crossMarkWalletSDK.sync.getResponse(id)
      return res
    } catch (err) {
      console.log(`Err `, err)
    }
  }

  const sendPaymentWithXamanWallet = async () => {
    try {
      if (xumm.payload) {
        if (!isMobile) {
          const paload = await xumm.payload.create({
            txjson: {
              TransactionType: "Payment",
              Destination: destination,
              Amount: amount
            },
          })
          if (paload?.refs.qr_png && paload?.next.always) {
            setQrCode(paload?.refs.qr_png)
            window.open(paload.next.always, "_blank");
          }
        } else {
          const payload = await xumm.payload?.createAndSubscribe({
            TransactionType: 'Payment',
            Destination: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ',
            Account: walletAddress,
            Amount: String(1337),
          }, event => {

            // Only return (websocket will live till non void)
            if (Object.keys(event.data).indexOf('signed') > -1) {
              return true
            }
          })

          if (payload) {
            // setPayloadUuid(payload.created.uuid)
            if (xumm.runtime.xapp) {
              xumm.xapp?.openSignRequest(payload.created)
            } else {
              if (payload.created.pushed && payload.created.next?.no_push_msg_received) {
                // setOpenPayloadUrl(payload.created.next.no_push_msg_received)
              } else {
                window.open(payload.created.next.always)
              }
            }
          }
        }


      }

    } catch (err) {
      console.log(`Err`, err)
    }
  }

  const sendToken = async () => {
    try {
      switch (connectedWallet) {
        case GEM_WALLET_CONNECT:
          await sendPaymentWithGemWallet()
          break;
        case CROSS_MARK_WALLET_CONNECT:
          await sendPaymentWithCrossMarkWallet()
          break;
        case XAMAN_WALLET_CONNECT:
          await sendPaymentWithXamanWallet()
          break;
        default:
          break;
      }
    } catch (err) {
      console.log(`Err`, err)
    }
  }

  return (
    <>
      <MainLayout>
        <div className=" mt-10 flex w-full justify-center items-center" >
          <div>
            <div>
              <button
                className="mt-2 rounded-md bg-green-500 hover:bg-green-600 w-48 h-12"
                onClick={handleConnnectGemWallet}
              >
                Connect with Gem
              </button>
            </div>
            <div>
              <button
                className="mt-2 rounded-md bg-red-500 hover:bg-red-600 w-48 h-12"
                onClick={handleCrossMarkWallet}
              >
                Connect with Crossmark
              </button>
            </div>
            <div>
              <button
                className="mt-2 rounded-md bg-purple-500 hover:bg-purple-600 w-48 h-12"
                onClick={handleConnectXummWallet}
              >
                Connect with Xumm
              </button>
            </div>
            <WalletConnect />
          </div>
        </div>
        <div>
          {qrcode && (
            <img src={qrcode} className=" hidden" />
          )}
        </div>
        <div className=" w-full" >
          {
            walletAddress !== "" && (
              <div className=" w-full max-w-[600px] flex justify-center items-center mx-auto" >
                <div className=" w-full " >
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="floating_address"
                      id="floating_address"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="floating_address"
                      className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${destination ? 'peer-focus:font-medium' : ''
                        } start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                    >
                      Receiver address
                    </label>
                  </div>

                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="number"
                      name="floating_amount"
                      id="floating_amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="floating_amount"
                      className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${amount ? 'peer-focus:font-medium' : ''
                        } start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                    >
                      Amount(XRP)
                    </label>
                  </div>

                  <div className="flex justify-center items-center" >
                    <button
                      className="mt-2 bg-blue-400 hover:bg-blue-500 w-48 h-12 rounded-md"
                      onClick={sendToken}
                      disabled={(parseFloat(amount) > 0 && destination) ? false : true}
                    >
                      <span className=" flex justify-center items-center m-2">
                        SEND
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </MainLayout>
    </>
  )
}

export default Home;