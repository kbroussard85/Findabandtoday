import { renderToBuffer } from '@react-pdf/renderer';
import { PerformanceContract } from './templates/PerformanceContract';
import React from 'react';

interface ContractData {
  gigId: string;
  artistName: string;
  venueName: string;
  eventDate: string;
  payout: string;
  terms: string;
}

/**
 * Renders the Performance Contract to a PDF Buffer.
 */
export async function generateContractBuffer(data: ContractData) {
  try {
    const element = React.createElement(PerformanceContract, data);
    const buffer = await renderToBuffer(element);
    return buffer;
  } catch (error) {
    console.error('[PDF_GENERATION_ERROR]:', error);
    throw new Error('Failed to generate contract PDF');
  }
}
