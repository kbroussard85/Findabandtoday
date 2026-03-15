/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToBuffer } from '@react-pdf/renderer';
import { PerformanceContract } from './templates/PerformanceContract';
import React from 'react';
import { logger } from '@/lib/logger';

interface ContractData {
  gigId: string;
  artistName: string;
  venueName: string;
  eventDate: string;
  payout: string;
  terms: string;
  i9Info?: string;
  stagePlot?: string;
  inputList?: string;
}

/**
 * Renders the Performance Contract to a PDF Buffer.
 */
export async function generateContractBuffer(data: ContractData) {
  try {
    const element = React.createElement(PerformanceContract, data) as React.ReactElement<any>;
    const buffer = await renderToBuffer(element);
    return buffer;
  } catch (error) {
    logger.error({ err: error }, '[PDF_GENERATION_ERROR]:');
    throw new Error('Failed to generate contract PDF');
  }
}
