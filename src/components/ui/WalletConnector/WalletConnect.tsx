import { createWallet, injectedProvider, walletConnect } from "thirdweb/wallets"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectButton } from "thirdweb/react";
import { useConnect } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb"
import { ThirdwebProvider } from "thirdweb/react";

const clientId = import.meta.env.VITE_CLIENT_ID || "";
const client = createThirdwebClient({ clientId });
const queryClient = new QueryClient();

const WalletConnect: React.FC = () => {
  const { connect, } = useConnect();
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
  ];
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <div>
          <button
            className="mt-2 rounded-md bg-blue-500 hover:bg-blue-600 w-48 h-12"
            onClick={() =>
              connect(async () => {
                const wallet = createWallet("com.ledger"); // pass the wallet id

                // Check if the user has the wallet installed and connect to it
                if (injectedProvider("com.ledger")) {
                  await wallet.connect({ client });
                } else {
                  // If the wallet is not detected, open WalletConnect modal for the user to scan the QR code and connect
                  await wallet.connect({
                    client,
                    walletConnect: {
                      showQrModal: true,
                    }
                  });
                }
                // Return the wallet to set it as the active wallet
                return wallet;
              })
            }
          >
            Connect with Ledger
          </button>
        </div>
        <div className=" my-5 flex justify-center items-center" >
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
            showAllWallets
            wallets={wallets}
            theme={"light"}
            connectModal={{
              size: "compact",
              showThirdwebBranding: false,
            }}

          />
        </div>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}

export default WalletConnect