'use client';

import { useCurrentAccount, useDisconnectWallet, useWallets, useConnectWallet } from '@mysten/dapp-kit';
import { useState } from 'react';

export default function WalletConnect() {
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const [showWalletList, setShowWalletList] = useState(false);

  const handleConnect = (wallet: any) => {
    connect(
      { wallet },
      {
        onSuccess: () => {
          console.log('Connected successfully');
          setShowWalletList(false);
        },
        onError: (error) => {
          console.error('Connection error:', error);
          alert(`Failed to connect: ${error.message}`);
        },
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (currentAccount) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
          <p className="text-white text-sm">
            {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletList(true)}
        className="bg-white hover:bg-purple-50 text-purple-700 font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
      >
        Connect Wallet
      </button>

      {showWalletList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWalletList(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Select a Wallet</h2>
            
            {wallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No wallets detected</p>
                <p className="text-sm text-gray-500">
                  Please install Sui Wallet, Suiet, or Martian wallet extension
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    {wallet.icon && (
                      <img 
                        src={typeof wallet.icon === 'string' ? wallet.icon : (wallet.icon as any).data || wallet.icon} 
                        alt={wallet.name} 
                        className="w-8 h-8"
                      />
                    )}
                    <span className="font-medium">{wallet.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowWalletList(false)}
              className="mt-4 w-full text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}