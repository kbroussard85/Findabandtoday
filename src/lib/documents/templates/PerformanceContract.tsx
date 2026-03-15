import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTop: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6b7280',
  }
});

interface PerformanceDetails {
  loadIn?: string;
  setStart?: string;
  duration?: number;
  payoutMethod?: string;
  technicalNotes?: string;
  venueClauses?: string;
}

interface ContractProps {
  gigId: string;
  artistName: string;
  venueName: string;
  eventDate: string;
  payout: string;
  terms: string;
  i9Info?: string;
  stagePlot?: string;
  inputList?: string;
  performanceDetails?: PerformanceDetails;
}

export const PerformanceContract = ({ 
  gigId, 
  artistName, 
  venueName, 
  eventDate, 
  payout, 
  terms,
  i9Info,
  stagePlot,
  inputList,
  performanceDetails
}: ContractProps) => (
  <Document>
    {/* Page 1: Main Agreement */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Agreement</Text>
        <Text style={styles.subtitle}>Reference ID: {gigId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Parties involved</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ARTIST:</Text>
          <Text style={styles.value}>{artistName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>VENUE:</Text>
          <Text style={styles.value}>{venueName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Event Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>DATE:</Text>
          <Text style={styles.value}>{eventDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TOTAL PAYOUT:</Text>
          <Text style={styles.value}>{payout}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PAYMENT METHOD:</Text>
          <Text style={styles.value}>{performanceDetails?.payoutMethod === 'FABT_PAY' ? 'FABT Digital Pay (Escrow)' : 'Cash Day of Show'}</Text>
        </View>
      </View>

      {performanceDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Schedule</Text>
          <View style={styles.row}>
            <Text style={styles.label}>LOAD-IN:</Text>
            <Text style={styles.value}>{performanceDetails.loadIn || 'TBD'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SET START:</Text>
            <Text style={styles.value}>{performanceDetails.setStart || 'TBD'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DURATION:</Text>
            <Text style={styles.value}>{performanceDetails.duration ? `${performanceDetails.duration} Minutes` : 'TBD'}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{performanceDetails ? '4' : '3'}. Agreed Terms & Clauses</Text>
        <Text style={styles.bodyText}>{terms}</Text>
        {performanceDetails?.venueClauses && (
          <Text style={{ ...styles.bodyText, marginTop: 10, fontStyle: 'italic' }}>
            Venue Specific: {performanceDetails.venueClauses}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{performanceDetails ? '5' : '4'}. Signatures</Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Artist / Band Signature</Text>
            <Text style={{ marginTop: 5, fontSize: 10 }}>{artistName}</Text>
            <Text style={{ fontSize: 8, marginTop: 10 }}>Date: ________________________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Venue Representative</Text>
            <Text style={{ marginTop: 5, fontSize: 10 }}>{venueName}</Text>
            <Text style={{ fontSize: 8, marginTop: 10 }}>Date: ________________________</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated by Findabandtoday AI Negotiator</Text>
        <Text style={styles.footerText}>Page 1</Text>
      </View>
    </Page>

    {/* Page 2: I-9 & Tax Compliance */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Tax & Compliance (I-9)</Text>
        <Text style={styles.subtitle}>Reference ID: {gigId}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Requirements</Text>
        <Text style={styles.bodyText}>
          {i9Info || "The Artist agrees to provide all necessary documentation for I-9 and tax compliance as requested by the Venue. Standard IRS regulations apply to all performance payouts."}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated by Findabandtoday AI Negotiator</Text>
        <Text style={styles.footerText}>Page 2</Text>
      </View>
    </Page>

    {/* Page 3: Technical Pack (Stage Plot & Input List) */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Technical Pack</Text>
        <Text style={styles.subtitle}>Reference ID: {gigId}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stage Plot</Text>
        <Text style={styles.bodyText}>{stagePlot || "Standard stage arrangement. See digital attachments for details."}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Input List</Text>
        <Text style={styles.bodyText}>{inputList || "Standard input configuration. Contact venue tech team for specific requirements."}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated by Findabandtoday AI Negotiator</Text>
        <Text style={styles.footerText}>Page 3</Text>
      </View>
    </Page>
  </Document>
);
