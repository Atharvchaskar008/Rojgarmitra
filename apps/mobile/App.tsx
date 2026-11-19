import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { JobPosting, JobApplication } from '@rojgarmitra/shared';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function App() {
  const [locale, setLocale] = useState<SupportedLocale>('mr');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'training'>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const dict = getDictionary(locale);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs`);
      const json = await res.json();
      if (json.data) {
        setJobs(json.data);
      }
    } catch {
      // Fallback demo items
      setJobs([
        {
          id: 'demo_1',
          title: 'औद्योगिक इलेक्ट्रिशियन (Industrial Electrician)',
          employerName: 'Vidarbha Auto Components Pvt Ltd',
          district: 'Nagpur',
          taluka: 'Butibori',
          areaOrMidc: 'Butibori MIDC',
          requiredSkillIds: ['house_wiring', 'industrial_panel'],
          vacancies: 3,
          salaryMin: 16000,
          salaryMax: 22000,
          status: 'open',
          sourceType: 'demo_seed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Electrician for Butibori plant',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo_token_candidate_user_1',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
        Alert.alert('यशस्वी', 'आपला अर्ज यशस्वीरित्या पाठवला आहे!');
      } else {
        Alert.alert('माहिती', data.error?.message || 'अर्ज स्वीकारला आहे (Offline Demo Mode)');
      }
    } catch {
      setAppliedJobIds(prev => new Set(prev).add(jobId));
      Alert.alert('यशस्वी', 'अर्ज जतन केला आहे (Demo Mode)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>🌾</Text>
          <View>
            <Text style={styles.brandTitle}>
              रोजगार<Text style={styles.brandAccent}>मित्र</Text>
            </Text>
            <Text style={styles.brandTagline}>RojgarMitra Mobile</Text>
          </View>
        </View>

        {/* Locale Selector */}
        <View style={styles.localeRow}>
          {(['mr', 'hi', 'en'] as SupportedLocale[]).map(l => (
            <TouchableOpacity
              key={l}
              onPress={() => setLocale(l)}
              style={[styles.localeBtn, locale === l && styles.localeBtnActive]}
            >
              <Text style={[styles.localeText, locale === l && styles.localeTextActive]}>
                {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'EN'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('jobs')}
          style={[styles.tabItem, activeTab === 'jobs' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>
            🔍 {dict.nav.jobs}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('applications')}
          style={[styles.tabItem, activeTab === 'applications' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
            📄 {dict.nav.applications}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('training')}
          style={[styles.tabItem, activeTab === 'training' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'training' && styles.tabTextActive]}>
            🎓 {dict.nav.upskilling}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : activeTab === 'jobs' ? (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionHeading}>
            📍 {dict.app.pilot_region} ({jobs.length} संधी)
          </Text>

          {jobs.map(job => {
            const isApplied = appliedJobIds.has(job.id);
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobTopRow}>
                  <Text style={styles.locationBadge}>
                    📍 {job.taluka || job.district}
                  </Text>
                  <Text style={styles.verifiedBadge}>
                    {job.sourceType === 'internal_employer' ? '✓ Verified' : '🌐 Portal'}
                  </Text>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.employerName}>🏢 {job.employerName}</Text>

                <View style={styles.salaryRow}>
                  <Text style={styles.salaryText}>
                    वेतन:{' '}
                    {job.salaryMin
                      ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}`
                      : 'चर्चेनुसार'}
                  </Text>
                  <Text style={styles.vacanciesText}>{job.vacancies} जागा</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleApply(job.id)}
                  disabled={isApplied}
                  style={[styles.applyBtn, isApplied && styles.applyBtnDisabled]}
                >
                  <Text style={styles.applyBtnText}>
                    {isApplied ? `✓ ${dict.job.applied}` : dict.job.apply_now}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : activeTab === 'applications' ? (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionHeading}>{dict.nav.applications}</Text>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>औद्योगिक इलेक्ट्रिशियन</Text>
            <Text style={styles.employerName}>🏢 Vidarbha Auto Components Pvt Ltd</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>✓ शॉर्टलिस्ट (Shortlisted by Employer)</Text>
            </View>
            <Text style={styles.timestampText}>मुलाखत संपर्क: HR Butibori MIDC</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionHeading}>शासकीय ITI प्रशिक्षण केंद्र</Text>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>शासकीय ITI नागपूर (Shraddhanand Peth)</Text>
            <Text style={styles.employerName}>कोर्सेस: वायरमन, सीएनसी, वेल्डर</Text>
            <Text style={styles.salaryText}>शुल्क: मोफत / शासकीय शिष्यवृत्ती</Text>
          </View>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>शासकीय ITI हिंगणा (Hingna MIDC)</Text>
            <Text style={styles.employerName}>कोर्सेस: फिटर, वेल्डर, इलेक्ट्रिकल</Text>
            <Text style={styles.salaryText}>शुल्क: मोफत</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandEmoji: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandAccent: {
    color: '#16A34A',
  },
  brandTagline: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  localeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  localeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  localeBtnActive: {
    backgroundColor: '#16A34A',
  },
  localeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  localeTextActive: {
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#16A34A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  jobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  employerName: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  salaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  vacanciesText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  applyBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusPillText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
