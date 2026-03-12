import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    backgroundColor: '#eee',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 20,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export interface ContractProps {
  gig: {
    id: string;
    title: string;
    date: Date;
    totalAmount: number;
    band: { name: string };
    venue: { name: string };
  };
  performanceDetails?: {
    loadIn?: string;
    setStart?: string;
    duration?: number;
    payoutMethod?: string;
    technicalNotes?: string;
    venueClauses?: string;
  };
}

export const PerformanceContract = ({ gig, performanceDetails }: ContractProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Agreement</Text>
        <Text>Reference ID: {gig.id.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Engagement Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Artist / Band:</Text>
          <Text>{gig.band.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Venue:</Text>
          <Text>{gig.venue.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Event Date:</Text>
          <Text>{new Date(gig.date).toLocaleDateString()}</Text>
        </View>
      </View>

      {performanceDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Schedule & Technicals</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Load-In Time:</Text>
            <Text>{performanceDetails.loadIn || 'TBD'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Set Start Time:</Text>
            <Text>{performanceDetails.setStart || 'TBD'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Performance Duration:</Text>
            <Text>{performanceDetails.duration ? `${performanceDetails.duration} Minutes` : 'TBD'}</Text>
          </View>
          {performanceDetails.technicalNotes && (
            <View style={styles.row}>
              <Text style={styles.label}>Technical Notes:</Text>
              <Text style={{ flex: 1 }}>{performanceDetails.technicalNotes}</Text>
            </View>
          )}
          {performanceDetails.venueClauses && (
            <View style={{ ...styles.row, marginTop: 10 }}>
              <Text style={styles.label}>Venue Specific Clauses:</Text>
              <Text style={{ flex: 1, fontSize: 10, fontStyle: 'italic' }}>{performanceDetails.venueClauses}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{performanceDetails ? '3' : '2'}. Compensation</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Guarantee:</Text>
          <Text>${gig.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text>{performanceDetails?.payoutMethod === 'FABT_PAY' ? 'FABT Digital Pay (Escrow)' : 'Cash Day of Show'}</Text>
        </View>
        <Text style={{ marginTop: 10, fontSize: 10, color: '#444' }}>
          {performanceDetails?.payoutMethod === 'FABT_PAY' 
            ? 'Payout will be processed automatically via the FindABandToday platform 24 hours following the successful completion of the performance.'
            : 'Venue is responsible for providing cash payment directly to the Artist immediately following the performance.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{performanceDetails ? '4' : '3'}. Signatures</Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Artist / Band Signature</Text>
            <Text style={{ marginTop: 5 }}>{gig.band.name}</Text>
            <Text style={{ fontSize: 8, marginTop: 15 }}>Date: ________________________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Venue Representative</Text>
            <Text style={{ marginTop: 5 }}>{gig.venue.name}</Text>
            <Text style={{ fontSize: 8, marginTop: 15 }}>Date: ________________________</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>FindABandToday Automation Engine — Electronically Signed & Verified</Text>
        <Text>Compliance with US Tax Law & I-9 Regulations Handled via Stripe Connect</Text>
      </View>
    </Page>
  </Document>
);
