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

interface ContractProps {
  gig: {
    id: string;
    title: string;
    date: Date;
    totalAmount: number;
    band: { name: string };
    venue: { name: string };
  };
}

export const PerformanceContract = ({ gig }: ContractProps) => (
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Compensation</Text>
        <Text>
          The Venue agrees to pay the Artist a total guarantee of ${gig.totalAmount.toFixed(2)}. 
          Payout will be processed automatically via the FindABandToday platform 24 hours 
          following the successful completion of the performance.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Terms & Conditions</Text>
        <Text>
          This agreement is legally binding once accepted by both parties via the platform. 
          Cancellation by either party within 48 hours of the event may result in a 
          cancellation fee as dictated by platform policy.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>FindABandToday Automation Engine — Electronically Signed & Verified</Text>
        <Text>Compliance with US Tax Law & I-9 Regulations Handled via Stripe Connect</Text>
      </View>
    </Page>
  </Document>
);
