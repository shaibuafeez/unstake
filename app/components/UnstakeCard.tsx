'use client';

import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

import type { SuiObjectResponse } from '@mysten/sui/client';

interface UnstakeCardProps {
  nft: SuiObjectResponse;
  kioskCaps: SuiObjectResponse[];
  config: {
    PACKAGE_ID: string;
    INK_DROPLETS_ID: string;
    TRANSFER_POLICY_ID: string;
  };
  onUnstaked: () => void;
}

export default function UnstakeCard({ nft, kioskCaps, config, onUnstaked }: UnstakeCardProps) {
  const [isUnstaking, setIsUnstaking] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Extract NFT data
  const nftData = nft.data;
  const content = nftData?.content;
  const fields = (content && 'fields' in content) ? (content as unknown as { fields: Record<string, unknown> }).fields : {};
  const stakingInfo = (fields.staking_info as { fields?: Record<string, unknown> })?.fields || {};
  
  const nftId = nftData?.objectId;
  const level = Number(stakingInfo.level) || 0;
  const rarity = String(stakingInfo.rarity || 'Unknown');
  const inkDropletsEarned = String(fields.ink_droplets_earned || '0');

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'mythic': return 'bg-red-500';
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleUnstake = async () => {
    if (!kioskCaps || kioskCaps.length === 0) {
      alert('No kiosk found. You need a kiosk to unstake NFTs.');
      return;
    }

    const kioskCap = kioskCaps[0];
    const kioskCapId = kioskCap.data?.objectId;
    const kioskCapContent = kioskCap.data?.content;
    const kioskId = (kioskCapContent && 'fields' in kioskCapContent) ? (kioskCapContent as unknown as { fields: { for?: string } }).fields?.for : undefined;

    if (!kioskCapId || !kioskId) {
      alert('Invalid kiosk data');
      return;
    }

    setIsUnstaking(true);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${config.PACKAGE_ID}::ink_sack_tasks::unstake_ika_chan_nft`,
        arguments: [
          tx.object(config.INK_DROPLETS_ID),
          tx.object(nftId!),
          tx.object(kioskId),
          tx.object(kioskCapId),
          tx.object(config.TRANSFER_POLICY_ID),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Unstaked successfully:', result);
            alert(`NFT unstaked successfully! Transaction: ${result.digest}`);
            onUnstaked();
          },
          onError: (error) => {
            console.error('Unstaking error:', error);
            alert(`Failed to unstake: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all">
      {/* NFT Image Placeholder */}
      <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg h-48 mb-4 flex items-center justify-center">
        <div className="text-white text-6xl">🦑</div>
      </div>

      {/* NFT Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">IKA Chan NFT</h3>
          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getRarityColor(rarity)}`}>
            {rarity}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-purple-200">
            <span>Level:</span>
            <span className="text-white font-medium">{level}</span>
          </div>
          <div className="flex justify-between text-purple-200">
            <span>Ink Earned:</span>
            <span className="text-white font-medium">{inkDropletsEarned}</span>
          </div>
        </div>

        {/* Object IDs */}
        <div className="pt-3 border-t border-white/20">
          <p className="text-xs text-purple-300 mb-1">Staked ID:</p>
          <p className="text-xs text-white/80 font-mono break-all">
            {nftId?.slice(0, 10)}...{nftId?.slice(-8)}
          </p>
        </div>

        {/* Unstake Button */}
        <button
          onClick={handleUnstake}
          disabled={isUnstaking || !kioskCaps || kioskCaps.length === 0}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUnstaking ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Unstaking...
            </span>
          ) : kioskCaps && kioskCaps.length > 0 ? (
            'Unstake NFT'
          ) : (
            'No Kiosk Available'
          )}
        </button>
      </div>
    </div>
  );
}