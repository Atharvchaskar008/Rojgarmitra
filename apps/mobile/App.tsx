import React, { useState, useEffect } from 'react';

declare const process: any;
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { JobPosting, JobApplication } from '@rojgarmitra/shared';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCzpFArgnEKLHCahzjY6LwsAqgdnDA4lDQ';

interface FirebaseUser {
  email: string;
  uid: string;
}

export default function App() {
  const [locale, setLocale] = useState<SupportedLocale>('mr');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'training' | 'account'>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Firebase Authentication State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const dict = getDictionary(locale);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setJobs(json.data);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      console.warn('[RojgarMitra Mobile] Failed to load jobs:', err?.message);
      setJobs([]);
      setFetchError(
        locale === 'mr'
          ? 'सर्व्हरशी संपर्क होऊ शकला नाही. इंटरनेट कनेक्शन तपासा.'
          : 'Could not connect to server. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Real Firebase Login via Google Identity Toolkit
  const handleFirebaseAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert(
        locale === 'mr' ? 'माहिती आवश्यक' : 'Required',
        locale === 'mr' ? 'कृपया ईमेल आणि पासवर्ड टाका.' : 'Please enter email and password.'
      );
      return;
    }

    setAuthLoading(true);
    const endpoint =
      authMode === 'signup'
        ? `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`
        : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword.trim(),
          returnSecureToken: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      setAuthToken(data.idToken);
      setCurrentUser({
        email: data.email,
        uid: data.localId,
      });

      Alert.alert(
        locale === 'mr' ? 'यशस्वी' : 'Success',
        locale === 'mr'
          ? `आपण ${data.email} म्हणून अधिकृतरीत्या लॉगिन झाले आहात!`
          : `Signed in successfully as ${data.email}!`
      );
      setActiveTab('jobs');
    } catch (err: any) {
      Alert.alert(
        locale === 'mr' ? 'लॉगिन त्रुटी' : 'Login Error',
        err.message || (locale === 'mr' ? 'प्रमाणीकरण अयशस्वी झाले.' : 'Authentication failed.')
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    Alert.alert(
      locale === 'mr' ? 'लॉगआउट' : 'Logged Out',
      locale === 'mr' ? 'आपण यशस्वीरित्या लॉगआउट झाला आहात.' : 'You have been logged out.'
    );
  };

  const handleApply = async (jobId: string) => {
    if (!authToken) {
      Alert.alert(
        locale === 'mr' ? 'लॉगिन आवश्यक' : 'Login Required',
        locale === 'mr'
          ? 'नोकरीसाठी अर्ज पाठवण्यासाठी कृपया आधी Account टॅबमध्ये जाऊन लॉगिन करा.'
          : 'Please sign in to your verified candidate account in the Account tab before applying.',
        [
          { text: locale === 'mr' ? 'रद्द करा' : 'Cancel', style: 'cancel' },
          {
            text: locale === 'mr' ? 'लॉगिन करा' : 'Sign In',
            onPress: () => setActiveTab('account'),
          },
        ]
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedJobIds((prev) => new Set(prev).add(jobId));
        Alert.alert(
          locale === 'mr' ? 'यशस्वी' : 'Success',
          locale === 'mr' ? 'आपला अर्ज यशस्वीरित्या पाठवला आहे!' : 'Application submitted successfully!'
        );
      } else {
        Alert.alert(
          locale === 'mr' ? 'त्रुटी' : 'Error',
          data.error?.message ||
            (locale === 'mr' ? 'अर्ज पाठवता आला नाही.' : 'Failed to submit application.')
        );
      }
    } catch (err: any) {
      Alert.alert(
        locale === 'mr' ? 'नेटवर्क त्रुटी' : 'Network Error',
        locale === 'mr'
          ? 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा.'
          : 'Could not reach server. Please check your connection.'
      );
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
          {(['mr', 'hi', 'en'] as SupportedLocale[]).map((l) => (
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

        <TouchableOpacity
          onPress={() => setActiveTab('account')}
          style={[styles.tabItem, activeTab === 'account' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'account' && styles.tabTextActive]}>
            👤 {currentUser ? 'Account ✓' : 'Login'}
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

          {fetchError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{fetchError}</Text>
            </View>
          )}

          {jobs.length === 0 && !fetchError && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {locale === 'mr'
                  ? 'सध्या थेट भरती सुरू असलेल्या नोकऱ्या उपलब्ध नाहीत.'
                  : 'No verified vacancies currently available in this sector.'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {locale === 'mr'
                  ? 'नवीन संधी शोधण्यासाठी कृपया नंतर पुन्हा तपासा किंवा शासकीय ITI प्रशिक्षण पर्याय पहा.'
                  : 'Please check back soon for direct vacancies or explore verified DVET ITI training opportunities.'}
              </Text>
            </View>
          )}

          {jobs.map((job) => {
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
                  <Text style={styles.vacanciesText}>
                    {job.vacancies && job.vacancies > 0 ? `${job.vacancies} जागा` : 'जागा: चर्चेनुसार'}
                  </Text>
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
          {appliedJobIds.size === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {locale === 'mr' ? 'अजून कोणताही अर्ज केलेला नाही.' : 'No active applications found.'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {locale === 'mr'
                  ? 'नोकऱ्या टॅबवर जाऊन आपल्या कौशल्यांनुसार संधींना थेट अर्ज करा.'
                  : 'Browse matching vacancies on the Jobs tab to apply.'}
              </Text>
            </View>
          ) : (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>
                {locale === 'mr' ? 'नोंदणीकृत अर्ज' : 'Submitted Applications'}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  ✓ {appliedJobIds.size}{' '}
                  {locale === 'mr' ? 'अर्ज यशस्वीरित्या नोंदवले' : 'application(s) registered'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      ) : activeTab === 'training' ? (
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionHeading}>शासकीय DVET ITI प्रशिक्षण केंद्र</Text>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>शासकीय ITI नागपूर (Shraddhanand Peth)</Text>
            <Text style={styles.employerName}>कोर्सेस: CTS वायरमन, सीएनसी, वेल्डर</Text>
            <Text style={styles.salaryText}>अधिकृत प्रवेश: admission.dvet.gov.in</Text>
          </View>
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>शासकीय ITI हिंगणा (Hingna MIDC)</Text>
            <Text style={styles.employerName}>कोर्सेस: CTS फिटर, वेल्डर, इलेक्ट्रिकल</Text>
            <Text style={styles.salaryText}>स्थान: हिंगणा एमआयडीसी, नागपूर ४४००१६</Text>
          </View>
        </ScrollView>
      ) : (
        /* Account & Firebase Authentication Tab */
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.sectionHeading}>
            {locale === 'mr' ? 'उमेदवार खाते व प्रमाणीकरण' : 'Candidate Account & Authentication'}
          </Text>

          {currentUser ? (
            <View style={styles.accountCard}>
              <Text style={styles.accountStatusBadge}>✓ Verified Firebase Account</Text>
              <Text style={styles.accountEmail}>{currentUser.email}</Text>
              <Text style={styles.accountUid}>UID: {currentUser.uid}</Text>
              <Text style={styles.tokenStatus}>Token: Secured (Bearer API Ready)</Text>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutBtnText}>
                  {locale === 'mr' ? 'लॉगआउट (Sign Out)' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authCard}>
              <Text style={styles.authTitle}>
                {authMode === 'signin'
                  ? locale === 'mr'
                    ? 'Firebase खात्यात लॉगिन करा'
                    : 'Sign in to Candidate Account'
                  : locale === 'mr'
                    ? 'नवीन उमेदवार नोंदणी करा'
                    : 'Create Candidate Account'}
              </Text>
              <Text style={styles.authSubtitle}>
                {locale === 'mr'
                  ? 'आपल्या अधिकृत Firebase क्रेडेन्शियल्सद्वारे लॉगिन करून टोकन प्राप्त करा.'
                  : 'Authenticate with Firebase to acquire valid authorization tokens for job applications.'}
              </Text>

              <Text style={styles.inputLabel}>ईमेल (Email)</Text>
              <TextInput
                style={styles.input}
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder="candidate@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>पासवर्ड (Password)</Text>
              <TextInput
                style={styles.input}
                value={authPassword}
                onChangeText={setAuthPassword}
                placeholder="••••••••"
                secureTextEntry
              />

              <TouchableOpacity
                onPress={handleFirebaseAuth}
                disabled={authLoading}
                style={[styles.authSubmitBtn, authLoading && styles.applyBtnDisabled]}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authSubmitText}>
                    {authMode === 'signin'
                      ? locale === 'mr'
                        ? 'लॉगिन करा (Sign In)'
                        : 'Sign In'
                      : locale === 'mr'
                        ? 'खाते तयार करा (Register)'
                        : 'Register'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
                style={styles.toggleAuthBtn}
              >
                <Text style={styles.toggleAuthText}>
                  {authMode === 'signin'
                    ? locale === 'mr'
                      ? 'नवीन खाते हवे आहे? नोंदणी करा →'
                      : "Don't have an account? Sign Up →"
                    : locale === 'mr'
                      ? 'आधीच खाते आहे? लॉगिन करा →'
                      : 'Already have an account? Sign In →'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandEmoji: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803D',
  },
  brandAccent: {
    color: '#047857',
  },
  brandTagline: {
    fontSize: 10,
    color: '#64748B',
  },
  localeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  localeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountStatusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  accountUid: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  tokenStatus: {
    fontSize: 12,
    color: '#0369A1',
    marginBottom: 16,
  },
  logoutBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 13,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  authSubmitBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  authSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleAuthBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleAuthText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
