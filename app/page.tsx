'use client';

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import UnstakeCard from './components/UnstakeCard';
import WalletConnect from './components/WalletConnect';

// Contract configuration
const CONFIG = {
  PACKAGE_ID: '0x0b490b62d277395afdc9b5349f93660e8672be6de9e83dca6381d300eb892e7a',
  INK_DROPLETS_ID: '0x30cbf174d7b80b290ea0b92ed51b69d917216407a22c658f734450390578db21',
  TRANSFER_POLICY_ID: '0x28c51b58178025263a2d2967abe3ec20e4d97084733e971f57650e54710b8a42',
};

export default function Home() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch staked NFTs
  const { data: stakedNFTs, isLoading, refetch } = useQuery({
    queryKey: ['stakedNFTs', account?.address],
    queryFn: async () => {
      if (!account) return [];
      
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${CONFIG.PACKAGE_ID}::ink_sack_tasks::StakedIkaChanNft`
        },
        options: {
          showType: true,
          showContent: true,
          showOwner: true,
        }
      });

      return objects.data || [];
    },
    enabled: !!account,
  });

  // Fetch kiosk owner caps
  const { data: kioskCaps } = useQuery({
    queryKey: ['kioskCaps', account?.address],
    queryFn: async () => {
      if (!account) return [];
      
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: '0x2::kiosk::KioskOwnerCap'
        },
        options: {
          showType: true,
          showContent: true,
        }
      });

      return objects.data || [];
    },
    enabled: !!account,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            🦑 IKA NFT Unstaking
          </h1>
          <p className="text-purple-200 text-lg">
            Unstake your IKA Chan NFTs from the Ink Sack Tasks pool
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnect />
        </div>

        {account && (
          <>
            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-purple-200 text-sm">Connected Wallet</p>
                  <p className="text-white font-mono text-xs mt-1">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Staked NFTs</p>
                  <p className="text-white text-2xl font-bold">{stakedNFTs?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center mb-6">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh NFTs'}
              </button>
            </div>

            {/* NFT Grid */}
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                <p className="text-white mt-4">Loading staked NFTs...</p>
              </div>
            ) : stakedNFTs && stakedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {stakedNFTs.map((nft) => (
                  <UnstakeCard
                    key={nft.data?.objectId}
                    nft={nft}
                    kioskCaps={kioskCaps || []}
                    config={CONFIG}
                    onUnstaked={refetch}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white text-xl">No staked NFTs found</p>
                <p className="text-purple-200 mt-2">
                  Stake your IKA Chan NFTs to start earning rewards
                </p>
              </div>
            )}
          </>
        )}

        {!account && (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-4">
              Connect your wallet to view staked NFTs
            </p>
            <p className="text-purple-200">
              Make sure you have Sui Wallet, Suiet, or another compatible wallet installed
            </p>
          </div>
        )}
      </div>
    </main>
  );
}