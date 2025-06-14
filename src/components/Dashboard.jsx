import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  User, 
  FileText, 
  Users, 
  BookOpen,
  LogOut,
  CheckCircle,
  GraduationCap,
  Settings,
  Plus,
  Trash2,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mataKuliahApi, nilaiApi } from '../lib/api/sixvaultApi';
import { decrypt as rsaDecrypt } from '../lib/crypto/RSA';
import AES from '../lib/crypto/AES';
import { toast } from 'react-toastify';



const Dashboard = () => {
  const { user, logout, getUserData, getUserRSAKeys } = useAuth();
  const [userData, setUserData] = useState(null);
  const [rsaKeys, setRsaKeys] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Academic data state (moved to top level)
  const [studentData, setStudentData] = useState({
    nim: '',
    namaLengkap: '',
    mataKuliah: Array(10).fill().map(() => ({
      kode: '',
      nama: '',
      sks: '',
      indeks: 'A'
    }))
  });
  const [ipk, setIpk] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Course management state for Kaprodi
  const [existingCourses, setExistingCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isAddingCourses, setIsAddingCourses] = useState(false);
  const [isRemovingCourses, setIsRemovingCourses] = useState(false);
  
  // Student grades state
  const [studentGrades, setStudentGrades] = useState([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isDecryptingGrades, setIsDecryptingGrades] = useState(false);
  const [gradesError, setGradesError] = useState('');
  const [decryptionStats, setDecryptionStats] = useState({ total: 0, successful: 0, failed: 0 });
  
  // Autocomplete state for academic data form
  const [courseSuggestions, setCourseSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState({});
  
  // Available courses from API
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoadingAvailableCourses, setIsLoadingAvailableCourses] = useState(true);

  // Predefined course data
  const predefinedCourses = {
    teknik_informatika: JSON.parse('[{"kode":"WI1102","nama":"Berpikir Komputasional","sks":"2"},{"kode":"WI2002","nama":"Literasi Data dan Inteligensi Artifisial","sks":"2"},{"kode":"MA1101","nama":"Matematika I","sks":"4"},{"kode":"IF1220","nama":"Matematika Diskrit","sks":"3"},{"kode":"FI1101","nama":"Fisika Dasar I","sks":"3"},{"kode":"IF1221","nama":"Logika Komputasional","sks":"2"},{"kode":"KI1101","nama":"Kimia Dasar I","sks":"3"},{"kode":"IF1230","nama":"Organisasi dan Arsitektur Komputer","sks":"3"},{"kode":"WI1101","nama":"Pancasila","sks":"2"},{"kode":"WI2001","nama":"Pengenalan Rekayasa dan Desain","sks":"3"},{"kode":"WI1103","nama":"Pengantar Prinsip Keberlanjutan","sks":"2"},{"kode":"WI2005","nama":"Bahasa Indonesia","sks":"2"},{"kode":"WI1111","nama":"Laboratorium Fisika Dasar","sks":"1"},{"kode":"IF1210","nama":"Algoritma dan Pemrograman 1","sks":"3"},{"kode":"WI1116","nama":"Laboratorium Interaksi Komputer","sks":"1"},{"kode":"IF2110","nama":"Algoritma dan Pemrograman 2","sks":"3"},{"kode":"IF2010","nama":"Pemrograman Berorientasi Objek","sks":"3"},{"kode":"IF2120","nama":"Probabilitas dan Statistika","sks":"3"},{"kode":"IF2211","nama":"Strategi Algoritma","sks":"3"},{"kode":"IF2123","nama":"Aljabar Linier dan Geometri","sks":"3"},{"kode":"IF2224","nama":"Teori Bahasa Formal dan Otomata","sks":"4"},{"kode":"IF2130","nama":"Sistem Operasi","sks":"3"},{"kode":"IF2230","nama":"Jaringan Komputer","sks":"3"},{"kode":"IF2150","nama":"Rekayasa Perangkat Lunak","sks":"4"},{"kode":"IF2240","nama":"Basis Data","sks":"3"},{"kode":"WI2003","nama":"Olah Raga","sks":"1"},{"kode":"WI2022","nama":"Manajemen Proyek","sks":"2"},{"kode":"IF2180","nama":"Sosio-informatika dan Profesionalisme","sks":"2"},{"kode":"IF3110","nama":"Pengembangan Aplikasi Web","sks":"3"},{"kode":"IF3210","nama":"Pengembangan Aplikasi Piranti Bergerak","sks":"2"},{"kode":"IF3130","nama":"Sistem Paralel dan Terdistribusi","sks":"3"},{"kode":"IF3250","nama":"Proyek Perangkat Lunak","sks":"4"},{"kode":"IF3140","nama":"Sistem Basis Data","sks":"3"},{"kode":"IF3270","nama":"Pembelajaran Mesin","sks":"3"},{"kode":"IF3141","nama":"Sistem Informasi","sks":"3"},{"kode":"WI2004","nama":"Bahasa Inggris","sks":"2"},{"kode":"IF3151","nama":"Interaksi Manusia Komputer","sks":"3"},{"kode":"IF3211","nama":"Komputasi Domain Spesifik","sks":"2"},{"kode":"IF3170","nama":"Inteligensi Artifisial","sks":"4"},{"kode":"WI201X","nama":"Agama","sks":"2"},{"kode":"IF4092","nama":"Tugas Akhir","sks":"4"},{"kode":"WI2006","nama":"Kewarganegaraan","sks":"2"},{"kode":"IF4090","nama":"Kerja Praktik","sks":"2"},{"kode":"IF4091","nama":"Penyusunan Proposal","sks":"2"},{"kode":"IF4010","nama":"Pemrograman Unit Pemrosesan Grafis","sks":"3"},{"kode":"IF4020","nama":"Kriptografi","sks":"3"},{"kode":"IF4021","nama":"Pemodelan dan Simulasi","sks":"3"},{"kode":"IF4031","nama":"Arsitektur Aplikasi Terdistribusi","sks":"3"},{"kode":"IF4033","nama":"Keamanan Siber","sks":"3"},{"kode":"IF4035","nama":"Blockchain","sks":"3"},{"kode":"IF4040","nama":"Pemodelan Data Lanjut","sks":"3"},{"kode":"IF4041","nama":"Penambangan Data","sks":"3"},{"kode":"IF4042","nama":"Sistem Temu Balik Informasi","sks":"3"},{"kode":"IF4044","nama":"Teknologi Big Data","sks":"3"},{"kode":"IF4050","nama":"Perkembangan dalam Rekayasa Perangkat Lunak","sks":"3"},{"kode":"IF4051","nama":"Pengembangan Sistem IoT","sks":"3"},{"kode":"IF4052","nama":"Komputasi Layanan","sks":"3"},{"kode":"IF4053","nama":"Keamanan Perangkat Lunak","sks":"3"},{"kode":"IF4054","nama":"Pengoperasian Sistem Perangkat Lunak","sks":"3"},{"kode":"IF4060","nama":"Rekayasa Interaksi","sks":"3"},{"kode":"IF4061","nama":"Visualisasi Data","sks":"3"},{"kode":"IF4062","nama":"Grafika Komputer","sks":"3"},{"kode":"IF4063","nama":"Gim dan Realitas Digital","sks":"3"},{"kode":"IF4070","nama":"Representasi Pengetahuan dan Penalaran","sks":"3"},{"kode":"IF4071","nama":"Pemrosesan Ucapan","sks":"3"},{"kode":"IF4072","nama":"Pemrosesan Bahasa Alami","sks":"3"},{"kode":"IF4073","nama":"Pemrosesan Citra Digital","sks":"3"},{"kode":"IF4074","nama":"Pembelajaran Mesin Lanjut","sks":"2"},{"kode":"IF4082","nama":"Pengembangan Keprofesian/Komunitas Informatika A","sks":"2"},{"kode":"IF4083","nama":"Pengembangan Keprofesian/Komunitas Informatika B","sks":"3"},{"kode":"IF4084","nama":"Pengembangan Keprofesian/Komunitas Informatika C","sks":"4"},{"kode":"IF4085","nama":"Topik Khusus Informatika A","sks":"2"},{"kode":"IF4086","nama":"Topik Khusus Informatika B","sks":"3"},{"kode":"IF4087","nama":"Topik Khusus Informatika C","sks":"4"},{"kode":"IF4088","nama":"Pengembangan Kemampuan Interpersonal","sks":"2"}]'),
    sistem_dan_teknologi_informasi: JSON.parse('[{"kode":"MA1101","nama":"Matematika I","sks":"4"},{"kode":"II1200","nama":"Pengantar Sistem dan Teknologi Informasi","sks":"3"},{"kode":"FI1101","nama":"Fisika Dasar I","sks":"3"},{"kode":"IF1210","nama":"Algoritma dan Pemrograman 1","sks":"3"},{"kode":"KI1101","nama":"Kimia Dasar I","sks":"3"},{"kode":"WI2001","nama":"Pengenalan Rekayasa dan Desain","sks":"3"},{"kode":"WI1101","nama":"Pancasila","sks":"2"},{"kode":"WI2005","nama":"Bahasa Indonesia","sks":"2"},{"kode":"WI1102","nama":"Berpikir Komputasional","sks":"2"},{"kode":"WI201X","nama":"Agama","sks":"2"},{"kode":"WI1103","nama":"Pengantar Prinsip Keberlanjutan","sks":"2"},{"kode":"WI2006","nama":"Kewarganegaraan","sks":"2"},{"kode":"WI1111","nama":"Laboratorium Fisika Dasar","sks":"1"},{"kode":"WI2002","nama":"Literasi Data dan Inteligensi Artifisial","sks":"2"},{"kode":"WI1116","nama":"Laboratorium Interaksi Komputer","sks":"1"},{"kode":"WI2003","nama":"Olah Raga","sks":"1"},{"kode":"II2100","nama":"Komunikasi Interpersonal dan Publik","sks":"2"},{"kode":"II2210","nama":"Teknologi Platform","sks":"3"},{"kode":"II2110","nama":"Matematika Diskret","sks":"3"},{"kode":"II2211","nama":"Probabilitas dan Statistik","sks":"3"},{"kode":"II2120","nama":"Jaringan Komputer","sks":"3"},{"kode":"II2221","nama":"Analisis Kebutuhan Enterprise","sks":"3"},{"kode":"II2130","nama":"Sistem dan Arsitektur Komputer","sks":"3"},{"kode":"II2240","nama":"Sistem Multimedia","sks":"3"},{"kode":"IF2040","nama":"Pemodelan Basis Data","sks":"3"},{"kode":"II2250","nama":"Manajemen Basis Data","sks":"2"},{"kode":"IF2010","nama":"Pemrograman Berorientasi Objek","sks":"3"},{"kode":"II2260","nama":"Internet of Things","sks":"3"},{"kode":"WI2004","nama":"Bahasa Inggris","sks":"2"},{"kode":"IF2050","nama":"Dasar Rekayasa Perangkat Lunak","sks":"3"},{"kode":"II3120","nama":"Layanan Sistem dan Teknologi Informasi","sks":"3"},{"kode":"II3220","nama":"Tata Kelola Teknologi Informasi","sks":"3"},{"kode":"II3130","nama":"Arsitektur Enterprise","sks":"3"},{"kode":"II3230","nama":"Keamanan Informasi","sks":"3"},{"kode":"II3131","nama":"Interaksi Manusia Komputer","sks":"3"},{"kode":"II3240","nama":"Rekayasa Sistem dan Teknologi Informasi","sks":"4"},{"kode":"II3140","nama":"Pengembangan Aplikasi Web dan Mobile","sks":"3"},{"kode":"IF3211","nama":"Komputasi Domain Spesifik","sks":"2"},{"kode":"II3160","nama":"Teknologi Sistem Terintegrasi","sks":"3"},{"kode":"WI2022","nama":"Manajemen Proyek","sks":"2"},{"kode":"II3170","nama":"Hukum dan Etika Teknologi Informasi","sks":"2"},{"kode":"IF3070","nama":"Dasar Inteligensi Artifisial","sks":"3"},{"kode":"II4091","nama":"Proposal Tugas Akhir","sks":"2"},{"kode":"II4092","nama":"Tugas Akhir","sks":"4"},{"kode":"II4090","nama":"Kerja Praktik","sks":"2"},{"kode":"II4010","nama":"Manajemen Data","sks":"3"},{"kode":"II4011","nama":"Transformasi Digital","sks":"3"},{"kode":"II4012","nama":"Inteligensi Artifisial untuk Bisnis","sks":"3"},{"kode":"II4013","nama":"Data Analytics","sks":"3"},{"kode":"II4021","nama":"Kriptografi","sks":"3"},{"kode":"II4022","nama":"Rekayasa Privasi Digital","sks":"3"},{"kode":"II4023","nama":"Forensik Digital","sks":"3"},{"kode":"II4024","nama":"Hukum Siber","sks":"3"},{"kode":"II4050","nama":"Rekayasa Sistem Multimedia","sks":"2"},{"kode":"II4051","nama":"Manajemen Produk","sks":"2"},{"kode":"II4052","nama":"Analisis dan Perancangan Kinerja Sistem","sks":"2"},{"kode":"II4053","nama":"Audit Teknologi Informasi","sks":"2"},{"kode":"II4071","nama":"Pengembangan Keprofesian/Komunitas STI A","sks":"2"},{"kode":"II4072","nama":"Pengembangan Keprofesian/Komunitas STI B","sks":"3"},{"kode":"II4073","nama":"Pengembangan Keprofesian/Komunitas STI C","sks":"4"},{"kode":"II4074","nama":"Pengembangan Soft Skills STI","sks":"2"},{"kode":"II4075","nama":"Inovasi dan Studi Mandiri STI","sks":"3"},{"kode":"II4077","nama":"Pengembangan Wirausaha STI","sks":"4"},{"kode":"II4078","nama":"Penelitian STI","sks":"4"},{"kode":"II4079","nama":"Topik Khusus STI A","sks":"2"},{"kode":"II4080","nama":"Topik Khusus STI B","sks":"3"},{"kode":"II4081","nama":"Topik Khusus STI C","sks":"4"}]')
  };

  useEffect(() => {
    const data = getUserData();
    const keys = getUserRSAKeys();
    setUserData(data);
    setRsaKeys(keys);
  }, []);

  // Fetch available courses from API
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        console.log('Starting to fetch available courses...');
        setIsLoadingAvailableCourses(true);
        
        // Check if we have access token
        const accessToken = localStorage.getItem('access_token');
        console.log('Access token exists:', !!accessToken);
        
        if (!accessToken) {
          throw new Error('No access token found');
        }
        
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/matakuliah/list`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log('API Response:', result);
          
          if (result.status === 'success' && Array.isArray(result.data)) {
            // Transform API response to match our expected format
            const transformedCourses = result.data.map(course => ({
              kode: course.kode,
              nama: course.matakuliah, // API uses "matakuliah" field
              sks: course.sks.toString() // Ensure SKS is string for consistency
            }));
            console.log('Transformed courses:', transformedCourses.length);
            setAvailableCourses(transformedCourses);
          } else {
            console.error('Invalid API response format:', result);
            toast.error('Failed to load available courses - Invalid response format');
          }
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching available courses:', error);
        toast.error(`Failed to load available courses: ${error.message}`);
      } finally {
        setIsLoadingAvailableCourses(false);
      }
    };

    // Fetch for dosen_wali and mahasiswa (mahasiswa needs it for SKS lookup)
    if (userData?.type === 'dosen_wali' || userData?.type === 'mahasiswa') {
      fetchAvailableCourses();
    } else {
      setIsLoadingAvailableCourses(false);
    }
  }, [userData?.type]);

  // Load existing courses when kaprodi accesses course management
  useEffect(() => {
    if (userData?.type === 'kaprodi' && activeTab === 'courses') {
      loadExistingCourses();
    }
  }, [userData, activeTab]);

  // Load student grades when mahasiswa accesses grades tab
  useEffect(() => {
    if (userData?.type === 'mahasiswa' && activeTab === 'grades') {
      loadStudentGrades();
    }
  }, [userData, activeTab]);

  // Grade point mapping
  const gradePoints = {
    'A': 4.0,
    'AB': 3.5,
    'B': 3.0,
    'BC': 2.5,
    'C': 2.0,
    'D': 1.0
  };

  // Calculate IPK automatically (moved to top level)
  useEffect(() => {
    const validCourses = studentData.mataKuliah.filter(mk => 
      mk.kode && mk.nama && mk.sks && mk.indeks
    );
    
    if (validCourses.length > 0) {
      const totalPoints = validCourses.reduce((sum, mk) => {
        return sum + (gradePoints[mk.indeks] * parseInt(mk.sks) || 0);
      }, 0);
      
      const totalSks = validCourses.reduce((sum, mk) => {
        return sum + (parseInt(mk.sks) || 0);
      }, 0);
      
      const calculatedIpk = totalSks > 0 ? totalPoints / totalSks : 0;
      setIpk(Math.round(calculatedIpk * 100) / 100);
    } else {
      setIpk(0);
    }
  }, [studentData.mataKuliah, gradePoints]);

  const handleLogout = () => {
    logout();
    // No need to reload, AuthContext will handle state change
  };

  // Academic data handlers (moved to top level)
  const handleStudentChange = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseChange = (index, field, value) => {
    setStudentData(prev => ({
      ...prev,
      mataKuliah: prev.mataKuliah.map((mk, i) => 
        i === index ? { ...mk, [field]: value } : mk
      )
    }));
  };

  // Get available courses from API
  const getAllCourses = () => {
    return availableCourses;
  };

  // Get all selected course codes (except for the current row)
  const getSelectedCourseCodes = (excludeIndex) => {
    return studentData.mataKuliah
      .map((mk, i) => (i !== excludeIndex ? mk.kode.trim().toLowerCase() : null))
      .filter(Boolean);
  };

  // Get all selected course names (except for the current row)
  const getSelectedCourseNames = (excludeIndex) => {
    return studentData.mataKuliah
      .map((mk, i) => (i !== excludeIndex ? mk.nama.trim().toLowerCase() : null))
      .filter(Boolean);
  };

  // Search courses by kode or nama, excluding already selected ones
  const searchCourses = (query, index) => {
    if (!query || query.length < 2) return [];
    const allCourses = getAllCourses();
    const lowerQuery = query.toLowerCase();
    const selectedCodes = getSelectedCourseCodes(index);
    const selectedNames = getSelectedCourseNames(index);
    return allCourses.filter(course =>
      (course.kode.toLowerCase().includes(lowerQuery) ||
        course.nama.toLowerCase().includes(lowerQuery)) &&
      !selectedCodes.includes(course.kode.toLowerCase()) &&
      !selectedNames.includes(course.nama.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
  };

  // Handle autocomplete input change (now passes index)
  const handleCourseAutocompleteChange = (index, field, value) => {
    // Check for duplicate kode/nama
    if (field === 'kode' && value.length >= 2) {
      const selectedCodes = getSelectedCourseCodes(index);
      if (selectedCodes.includes(value.trim().toLowerCase())) {
        toast.error('Mata kuliah dengan kode ini sudah dipilih di baris lain!');
        return;
      }
    }
    if (field === 'nama' && value.length >= 2) {
      const selectedNames = getSelectedCourseNames(index);
      if (selectedNames.includes(value.trim().toLowerCase())) {
        toast.error('Mata kuliah dengan nama ini sudah dipilih di baris lain!');
        return;
      }
    }
    handleCourseChange(index, field, value);
    if (value.length >= 2) {
      const suggestions = searchCourses(value, index);
      setCourseSuggestions(prev => ({
        ...prev,
        [`${index}_${field}`]: suggestions
      }));
      setShowSuggestions(prev => ({
        ...prev,
        [`${index}_${field}`]: suggestions.length > 0
      }));
      setActiveSuggestionIndex(prev => ({
        ...prev,
        [`${index}_${field}`]: -1
      }));
    } else {
      setShowSuggestions(prev => ({
        ...prev,
        [`${index}_${field}`]: false
      }));
    }
  };

  // Handle selecting a course from suggestions
  const handleCourseSelect = (index, course) => {
    // Update all course fields
    setStudentData(prev => ({
      ...prev,
      mataKuliah: prev.mataKuliah.map((mk, i) => 
        i === index ? {
          ...mk,
          kode: course.kode,
          nama: course.nama,
          sks: course.sks
        } : mk
      )
    }));
    
    // Hide all suggestions for this row
    setShowSuggestions(prev => {
      const newState = { ...prev };
      delete newState[`${index}_kode`];
      delete newState[`${index}_nama`];
      return newState;
    });
    
    // Clear suggestions
    setCourseSuggestions(prev => {
      const newState = { ...prev };
      delete newState[`${index}_kode`];
      delete newState[`${index}_nama`];
      return newState;
    });
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e, index, field) => {
    const suggestionKey = `${index}_${field}`;
    const suggestions = courseSuggestions[suggestionKey] || [];
    const activeIndex = activeSuggestionIndex[suggestionKey] || -1;
    
    if (suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => ({
          ...prev,
          [suggestionKey]: activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0
        }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => ({
          ...prev,
          [suggestionKey]: activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1
        }));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleCourseSelect(index, suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(prev => ({
          ...prev,
          [suggestionKey]: false
        }));
        break;
    }
  };

  // Hide suggestions when clicking outside
  const handleBlur = (index, field) => {
    // Delay hiding to allow for click on suggestion
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [`${index}_${field}`]: false
      }));
    }, 200);
  };

  const handleSearchStudent = async () => {
    if (!studentData.nim) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/student/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ nim_nip: studentData.nim }),
      });

      if (response.ok) {
        const result = await response.json();
        setStudentData(prev => ({
          ...prev,
          namaLengkap: result.data.nama
        }));
      }
    } catch (error) {
      console.error('Error searching student:', error);
    }
  };

  const handleSubmitAcademicData = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const validCourses = studentData.mataKuliah.filter(mk => 
        mk.kode && mk.nama && mk.sks && mk.indeks
      );
      const nilaiData = validCourses.map(mk => ({
        nim: studentData.nim,
        kode: mk.kode,
        nama: mk.nama,
        nilai: mk.indeks,
        nip: userData.nim_nip // Current dosen's NIP
      }));
      // Submit grades
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/nilai/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(nilaiData),
      });
              if (response.ok) {
          toast.success('Academic data submitted successfully!');
          // Reset form
          setStudentData({
            nim: '',
            namaLengkap: '',
            mataKuliah: Array(10).fill().map(() => ({
              kode: '',
              nama: '',
              sks: '',
              indeks: 'A'
            }))
          });
          // Clear autocomplete state
          setCourseSuggestions({});
          setShowSuggestions({});
          setActiveSuggestionIndex({});
        } else {
        throw new Error('Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting academic data:', error);
      toast.error('Error submitting data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Course management functions
  const loadExistingCourses = async () => {
    if (userData?.type !== 'kaprodi') return;
    setIsLoadingCourses(true);
    try {
      const response = await mataKuliahApi.listCourses();
      if (response.status === 'success') {
        setExistingCourses(response.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Error loading courses. Please try again.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const addPredefinedCourses = async () => {
    if (!userData?.prodi || !predefinedCourses[userData.prodi]) {
      toast.info('No predefined courses available for your program.');
      return;
    }
    setIsAddingCourses(true);
    try {
      const coursesToAdd = predefinedCourses[userData.prodi].map(course => ({
        kode: course.kode,
        matakuliah: course.nama,
        sks: parseInt(course.sks)
      }));
      const response = await mataKuliahApi.addCourses(coursesToAdd);
      if (response.status === 'success') {
        toast.success('Predefined courses added successfully!');
        await loadExistingCourses(); // Reload the list
      }
    } catch (error) {
      console.error('Error adding courses:', error);
      toast.error('Error adding courses. Please try again.');
    } finally {
      setIsAddingCourses(false);
    }
  };

  // Custom confirm toast for removal
  const showRemoveConfirm = (onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div>
          <div className="font-semibold mb-2">Are you sure you want to remove {selectedCourses.length} selected courses?</div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => { onConfirm(); closeToast(); }}
            >
              Yes, Remove
            </button>
            <button
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const removeSelectedCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.info('Please select courses to remove.');
      return;
    }
    // Show confirm toast
    showRemoveConfirm(async () => {
      setIsRemovingCourses(true);
      try {
        const response = await mataKuliahApi.removeCourses(selectedCourses);
        if (response.status === 'success') {
          toast.success(`${selectedCourses.length} courses removed successfully!`);
          setSelectedCourses([]);
          await loadExistingCourses(); // Reload the list
        }
      } catch (error) {
        console.error('Error removing courses:', error);
        toast.error('Error removing courses. Please try again.');
      } finally {
        setIsRemovingCourses(false);
      }
    });
  };

  const toggleCourseSelection = (kode) => {
    setSelectedCourses(prev => 
      prev.includes(kode) 
        ? prev.filter(k => k !== kode)
        : [...prev, kode]
    );
  };

  const selectAllCourses = () => {
    if (selectedCourses.length === existingCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(existingCourses.map(course => course.kode));
    }
  };

  // Student grades functions
  const loadStudentGrades = async () => {
    if (userData?.type !== 'mahasiswa') return;
    setIsLoadingGrades(true);
    setIsDecryptingGrades(false);
    setGradesError('');
    setDecryptionStats({ total: 0, successful: 0, failed: 0 });
    
    try {
      const response = await nilaiApi.getStudentGrades();
      if (response.status === 'success' && response.data) {
        const encryptedRecords = response.data.records || [];
        const decryptedGrades = [];
        
        if (encryptedRecords.length === 0) {
          setGradesError('No grade records found.');
          setStudentGrades([]);
          return;
        }

        // Get user's private key for RSA decryption
        const privateKey = localStorage.getItem('rsa_private_key');
        if (!privateKey) {
          throw new Error('Private key not found. Please login again.');
        }

        // Start decryption process
        setIsLoadingGrades(false);
        setIsDecryptingGrades(true);
        
        let successful = 0;
        let failed = 0;
        const total = encryptedRecords.length;

        // Decrypt each grade record
        for (const record of encryptedRecords) {
          try {
            // Step 1: Decrypt the AES key using RSA private key
            console.log('[DEBUG] Encrypted AES key:', record.rsa_encrypted_aes_key);
            console.log('[DEBUG] Private key (first 20 chars):', privateKey ? privateKey.slice(0, 20) + '...' : 'null');
            let decryptedAESKey;
            try {
              decryptedAESKey = rsaDecrypt(record.rsa_encrypted_aes_key, privateKey);
              console.log('[DEBUG] Decrypted AES key:', decryptedAESKey);
            } catch (rsaError) {
              console.error('[DEBUG] RSA decryption failed:', rsaError);
              throw rsaError;
            }
            
            // Step 2: Initialize AES with the decrypted key (try different key sizes)
            let aes;
            let decryptedKode, decryptedNama, decryptedNilai, sks = '0';
            
            // Try AES-256 first, then AES-128 if that fails
            try {
              aes = new AES();
              decryptedKode = aes.decrypt(record.encrypted_data.kode, decryptedAESKey);
              decryptedNama = aes.decrypt(record.encrypted_data.nama, decryptedAESKey);
              decryptedNilai = aes.decrypt(record.encrypted_data.nilai, decryptedAESKey);
            } catch (aes256Error) {
              console.log('AES default failed, trying again:', aes256Error.message);
              aes = new AES();
              decryptedKode = aes.decrypt(record.encrypted_data.kode, decryptedAESKey);
              decryptedNama = aes.decrypt(record.encrypted_data.nama, decryptedAESKey);
              decryptedNilai = aes.decrypt(record.encrypted_data.nilai, decryptedAESKey);
            }
            
            // Step 4: Get SKS from mata kuliah data (if available) or from encrypted data
            if (record.encrypted_data.sks) {
              sks = aes.decrypt(record.encrypted_data.sks, decryptedAESKey);
            } else {
              // If SKS is not encrypted, try to get it from available courses
              const matchingCourse = availableCourses.find(course => 
                course.kode === decryptedKode
              );
              if (matchingCourse) {
                sks = matchingCourse.sks;
              }
            }

            decryptedGrades.push({
              id: record.id,
              kode: decryptedKode,
              nama: decryptedNama,
              nilai: decryptedNilai,
              sks: sks,
              nip_dosen: record.nip_dosen
            });
            
            successful++;
          } catch (decryptError) {
            console.error('Error decrypting record:', decryptError);
            failed++;
            // Don't show toast for each failed record to avoid spam
          }
          
          // Update decryption progress
          setDecryptionStats({ 
            total, 
            successful, 
            failed 
          });
        }

        setStudentGrades(decryptedGrades);
        
        // Show final results
        if (successful > 0) {
          toast.success(`Successfully decrypted ${successful} out of ${total} grade records.`);
        }
        
        if (failed > 0) {
          toast.warning(`Failed to decrypt ${failed} out of ${total} grade records.`);
        }
        
        if (decryptedGrades.length === 0 && encryptedRecords.length > 0) {
          setGradesError('Failed to decrypt all grade records. Please check your credentials or contact support.');
        }
      } else {
        setGradesError(response.message || 'No grades found');
        setStudentGrades([]);
      }
    } catch (error) {
      console.error('Error loading student grades:', error);
      setGradesError(`Error loading grades: ${error.message}`);
      setStudentGrades([]);
    } finally {
      setIsLoadingGrades(false);
      setIsDecryptingGrades(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    ...(userData?.type === 'mahasiswa' ? [{ id: 'grades', label: 'My Grades', icon: BookOpen }] : []),
    ...(userData?.type === 'dosen_wali' ? [{ id: 'academic', label: 'Academic Data', icon: GraduationCap }] : []),
    ...(userData?.type === 'kaprodi' ? [{ id: 'courses', label: 'Course Management', icon: Settings }] : []),
  ];

  const cryptoFeatures = [
    {
      name: 'RSA Encryption',
      description: 'Digital signatures and key exchange',
      status: 'Active',
      icon: Key
    },
    {
      name: 'AES Encryption',
      description: 'Symmetric encryption for data protection',
      status: 'Active',
      icon: Lock
    },
    {
      name: 'Shamir Secret Sharing',
      description: 'Distributed key management',
      status: 'Active',
      icon: Shield
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Sixvault</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Your Profile</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">NIM/NIP:</span> {userData?.nim_nip}</p>
              <p><span className="font-medium">Name:</span> {userData?.nama}</p>
              <p><span className="font-medium">Type:</span> {userData?.type}</p>
              <p><span className="font-medium">Program:</span> {userData?.prodi}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Security Status</h4>
            <div className="space-y-2">
              {cryptoFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {cryptoFeatures.map((feature, index) => (
          <div key={index} className="card bg-gradient-to-br from-blue-50 to-indigo-50">
            <feature.icon className="h-8 w-8 text-primary-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">{feature.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {feature.status}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">RSA Key Pair</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <textarea
              readOnly
              value={rsaKeys?.publicKey || 'Loading...'}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Private Key (Protected)
            </label>
            <textarea
              readOnly
              value="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Private key is securely stored and encrypted
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAcademicData = () => {

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Input Academic Data</h3>
          
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIM
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={studentData.nim}
                  onChange={(e) => handleStudentChange('nim', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter student NIM"
                />
                <button
                  onClick={handleSearchStudent}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={studentData.namaLengkap}
                onChange={(e) => handleStudentChange('namaLengkap', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Full name"
              />
            </div>
          </div>

          {/* Courses Table */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Mata Kuliah (Courses)</h4>
            
            {isLoadingAvailableCourses ? (
              <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-800">Loading available courses...</p>
                </div>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="bg-red-50 p-3 rounded-lg mb-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-red-800">
                    <p className="font-medium">No courses available</p>
                    <p className="text-xs">Please contact your administrator or refresh the page to try again.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to use autocomplete ({availableCourses.length} courses available):</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Type at least 2 characters in <strong>Kode MK</strong> or <strong>Nama Mata Kuliah</strong> fields</li>
                      <li>Select from the dropdown suggestions or use arrow keys to navigate</li>
                      <li>Press Enter to select or click on a suggestion</li>
                      <li>All fields (Kode, Nama, SKS) will be automatically filled</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Kode MK</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Mata Kuliah</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">SKS</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Indeks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.mataKuliah.map((mk, index) => (
                                          <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2 relative">
                          <input
                            type="text"
                            value={mk.kode}
                            onChange={(e) => handleCourseAutocompleteChange(index, 'kode', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'kode')}
                            onBlur={() => handleBlur(index, 'kode')}
                            disabled={isLoadingAvailableCourses}
                            className={`w-full p-2 border-0 focus:ring-1 focus:ring-primary-500 text-sm ${
                              isLoadingAvailableCourses ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder={isLoadingAvailableCourses ? "Loading courses..." : "e.g., IF3020"}
                            autoComplete="off"
                          />
                          {/* Suggestions dropdown for Kode */}
                          {showSuggestions[`${index}_kode`] && courseSuggestions[`${index}_kode`] && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {courseSuggestions[`${index}_kode`].map((course, suggestionIndex) => (
                                <div
                                  key={`${course.kode}-${suggestionIndex}`}
                                  className={`px-3 py-2 cursor-pointer text-sm ${
                                    activeSuggestionIndex[`${index}_kode`] === suggestionIndex
                                      ? 'bg-primary-100 text-primary-900'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleCourseSelect(index, course)}
                                >
                                  <div className="font-medium">{course.kode}</div>
                                  <div className="text-xs text-gray-600 truncate">{course.nama}</div>
                                  <div className="text-xs text-gray-500">{course.sks} SKS</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 relative">
                          <input
                            type="text"
                            value={mk.nama}
                            onChange={(e) => handleCourseAutocompleteChange(index, 'nama', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'nama')}
                            onBlur={() => handleBlur(index, 'nama')}
                            disabled={isLoadingAvailableCourses}
                            className={`w-full p-2 border-0 focus:ring-1 focus:ring-primary-500 text-sm ${
                              isLoadingAvailableCourses ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder={isLoadingAvailableCourses ? "Loading courses..." : "Course name"}
                            autoComplete="off"
                          />
                          {/* Suggestions dropdown for Nama */}
                          {showSuggestions[`${index}_nama`] && courseSuggestions[`${index}_nama`] && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {courseSuggestions[`${index}_nama`].map((course, suggestionIndex) => (
                                <div
                                  key={`${course.kode}-${suggestionIndex}`}
                                  className={`px-3 py-2 cursor-pointer text-sm ${
                                    activeSuggestionIndex[`${index}_nama`] === suggestionIndex
                                      ? 'bg-primary-100 text-primary-900'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleCourseSelect(index, course)}
                                >
                                  <div className="font-medium">{course.kode}</div>
                                  <div className="text-xs text-gray-600 truncate">{course.nama}</div>
                                  <div className="text-xs text-gray-500">{course.sks} SKS</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={mk.sks}
                            disabled={true}
                            className="w-full p-2 border-0 bg-gray-50 text-gray-600 text-sm text-center cursor-not-allowed"
                            placeholder="Auto-filled"
                            title="SKS will be automatically filled when you select a course"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={mk.indeks}
                            onChange={(e) => handleCourseChange(index, 'indeks', e.target.value)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-primary-500 text-sm"
                          >
                            <option value="A">A</option>
                            <option value="AB">AB</option>
                            <option value="B">B</option>
                            <option value="BC">BC</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IPK Display */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">IPK (Indeks Prestasi Kumulatif)</h4>
              <div className="text-2xl font-bold text-primary-600">
                {ipk.toFixed(2)}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Calculated automatically based on entered grades and credits
            </p>
          </div>

          {/* Submit Button */}
                    <div className="flex justify-end">
            <button
              onClick={handleSubmitAcademicData}
              disabled={isSubmitting || !studentData.nim || !studentData.namaLengkap || isLoadingAvailableCourses}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>
                {isSubmitting ? 'Submitting...' : 
                 isLoadingAvailableCourses ? 'Loading courses...' : 
                 'Submit Academic Data'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderCourseManagement = () => {
    const programDisplayName = userData?.prodi === 'teknik_informatika' 
      ? 'Teknik Informatika' 
      : 'Sistem dan Teknologi Informasi';

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Course Management - {programDisplayName}
          </h3>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={addPredefinedCourses}
              disabled={isAddingCourses}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingCourses ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{isAddingCourses ? 'Adding...' : 'Add Predefined Courses'}</span>
            </button>
            
            <button
              onClick={removeSelectedCourses}
              disabled={isRemovingCourses || selectedCourses.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRemovingCourses ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{isRemovingCourses ? 'Removing...' : `Remove Selected (${selectedCourses.length})`}</span>
            </button>
            
            <button
              onClick={loadExistingCourses}
              disabled={isLoadingCourses}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Course Statistics */}
          {existingCourses.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{existingCourses.length}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedCourses.length}</div>
                  <div className="text-sm text-gray-600">Selected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {existingCourses.reduce((sum, course) => sum + parseInt(course.sks || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total SKS</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingCourses && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          )}

          {/* Course List */}
          {!isLoadingCourses && existingCourses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCourses.length === existingCourses.length && existingCourses.length > 0}
                        onChange={selectAllCourses}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Kode</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Mata Kuliah</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">SKS</th>
                  </tr>
                </thead>
                <tbody>
                  {existingCourses.map((course, index) => (
                    <tr key={course.kode || index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.kode)}
                          onChange={() => toggleCourseSelection(course.kode)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">{course.kode}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{course.nama || course.matakuliah}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-center">{course.sks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingCourses && existingCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No courses found for {programDisplayName}</p>
              <button
                onClick={addPredefinedCourses}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Predefined Courses</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Predefined Courses Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="card"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Available Predefined Courses for {programDisplayName}
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              {predefinedCourses[userData?.prodi]?.length || 0} courses available
            </p>
            <div className="text-xs text-gray-500">
              Click "Add Predefined Courses" to add all courses for your program study.
              You can then remove individual courses using the checkboxes above.
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderStudentGrades = () => {
    // Calculate GPA
    const calculateGPA = () => {
      if (studentGrades.length === 0) return 0;
      
      const validGrades = studentGrades.filter(grade => 
        grade.nilai && grade.sks && gradePoints[grade.nilai]
      );
      
      if (validGrades.length === 0) return 0;
      
      const totalPoints = validGrades.reduce((sum, grade) => {
        return sum + (gradePoints[grade.nilai] * parseInt(grade.sks || 0));
      }, 0);
      
      const totalSks = validGrades.reduce((sum, grade) => {
        return sum + parseInt(grade.sks || 0);
      }, 0);
      
      return totalSks > 0 ? totalPoints / totalSks : 0;
    };

    const gpa = calculateGPA();
    const totalSks = studentGrades.reduce((sum, grade) => sum + parseInt(grade.sks || 0), 0);

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">My Academic Grades</h3>
          
          {/* GPA Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{gpa.toFixed(2)}</div>
              <div className="text-sm opacity-90">Grade Point Average</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{studentGrades.length}</div>
              <div className="text-sm opacity-90">Total Courses</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{totalSks}</div>
              <div className="text-sm opacity-90">Total Credits (SKS)</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingGrades && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your encrypted grades...</p>
            </div>
          )}

          {/* Decryption State */}
          {isDecryptingGrades && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-2">Decrypting your grades...</p>
              {decryptionStats.total > 0 && (
                <div className="text-sm text-gray-500">
                  <p>Progress: {decryptionStats.successful + decryptionStats.failed} / {decryptionStats.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((decryptionStats.successful + decryptionStats.failed) / decryptionStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {gradesError && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Error loading grades</p>
                  <p className="text-red-600 text-sm">{gradesError}</p>
                </div>
              </div>
              <button
                onClick={loadStudentGrades}
                disabled={isLoadingGrades || isDecryptingGrades}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoadingGrades || isDecryptingGrades ? 'Loading...' : 'Try Again'}
              </button>
            </div>
          )}

          {/* Security Info */}
          {!isLoadingGrades && !isDecryptingGrades && studentGrades.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Secure Decryption Complete</p>
                  <p className="text-green-600 text-sm">
                    Your grades were securely decrypted using your private RSA key and AES encryption. 
                    {decryptionStats.total > 0 && (
                      <span> Successfully processed {decryptionStats.successful} out of {decryptionStats.total} records.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grades Table */}
          {!isLoadingGrades && !isDecryptingGrades && !gradesError && studentGrades.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">No</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Course Code</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Course Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Credits</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm font-mono">{grade.kode}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">{grade.nama}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-center">{grade.sks}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          grade.nilai === 'A' ? 'bg-green-100 text-green-800' :
                          grade.nilai === 'AB' ? 'bg-blue-100 text-blue-800' :
                          grade.nilai === 'B' ? 'bg-indigo-100 text-indigo-800' :
                          grade.nilai === 'BC' ? 'bg-purple-100 text-purple-800' :
                          grade.nilai === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.nilai}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                        {gradePoints[grade.nilai] ? gradePoints[grade.nilai].toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingGrades && !isDecryptingGrades && !gradesError && studentGrades.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No grades found</p>
              <p className="text-sm text-gray-500">Your academic grades will appear here once they are added by your academic advisor.</p>
              <button
                onClick={loadStudentGrades}
                disabled={isLoadingGrades || isDecryptingGrades}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </motion.div>

        {/* Grade Scale Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Grade Scale</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(gradePoints).map(([grade, points]) => (
                <div key={grade} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{grade}</div>
                  <div className="text-sm text-gray-600">{points.toFixed(1)} points</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <Key className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">RSA Key Decryption</p>
                  <p>Your private RSA key decrypts the AES encryption keys stored with each grade record.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">AES Data Decryption</p>
                  <p>Grade data is encrypted using AES symmetric encryption for secure storage.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Client-Side Processing</p>
                  <p>All decryption happens in your browser - your private key never leaves your device.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'security':
        return renderSecurity();
      case 'grades':
        return renderStudentGrades();
      case 'academic':
        return renderAcademicData();
      case 'courses':
        return renderCourseManagement();
      default:
        return renderOverview();
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold gradient-text">Sixvault</h1>
                <p className="text-xs text-gray-600">Secure Academic Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userData.nama}</p>
                <p className="text-xs text-gray-600">{userData.type} • {userData.nim_nip}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="card p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Navigation</h2>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 