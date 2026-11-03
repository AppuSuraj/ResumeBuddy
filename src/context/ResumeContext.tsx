import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ResumeData, 
  PersonalDetails, 
  WorkExperience, 
  Education, 
  SkillCategory, 
  Project, 
  CustomSection, 
  StyleConfig, 
  JobDescriptionData, 
  TemplateId,
  UserProfileCache 
} from '../types/resume';
import { INITIAL_RESUME_DATA, createBlankResume } from '../services/defaultData';
import { analyzeJobDescription } from '../services/aiService';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { isAdminAuthenticated } from '../services/adminAuthService';

interface ResumeContextType {
  resumeData: ResumeData; // The actively editing resume
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  
  // Persistent User Contact Profile Cache
  userProfile: UserProfileCache;
  updateUserProfile: (profile: Partial<UserProfileCache>) => void;
  startCleanResumeWithProfile: (roleTitle: string, jdText: string) => void;
  clearResumeToBlank: () => void;

  // Multi-Resume Management
  resumes: ResumeData[];
  currentResumeId: string;
  createNewResume: (title?: string) => void;
  switchResume: (id: string) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => void;
  branchResume: (sourceId: string, branchRoleTitle: string, customTitle?: string) => string;
  renameResume: (id: string, newTitle: string) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  isJdModalOpen: boolean;
  setIsJdModalOpen: (open: boolean) => void;
  
  // Section update actions
  updatePersonal: (personal: Partial<PersonalDetails>) => void;
  updateExperienceItem: (id: string, exp: Partial<WorkExperience>) => void;
  addExperienceItem: () => void;
  deleteExperienceItem: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
  toggleBulletBankItem: (expId: string, bulletId: string) => void;
  addBulletToBank: (expId: string, text: string) => void;
  deleteBulletFromBank: (expId: string, bulletId: string) => void;
  
  updateEducationItem: (id: string, edu: Partial<Education>) => void;
  addEducationItem: () => void;
  deleteEducationItem: (id: string) => void;

  updateSkillCategory: (id: string, cat: Partial<SkillCategory>) => void;
  addSkillCategory: () => void;
  deleteSkillCategory: (id: string) => void;

  updateProjectItem: (id: string, proj: Partial<Project>) => void;
  addProjectItem: () => void;
  deleteProjectItem: (id: string) => void;

  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  addCustomSection: (title?: string) => void;
  deleteCustomSection: (id: string) => void;

  updateJobTarget: (roleTitle: string, jdText: string) => void;
  updateStyleConfig: (style: Partial<StyleConfig>) => void;
  
  loadSampleData: () => void;
  clearAllData: () => void;
  exportAsJson: () => void;
  importFromJson: (jsonStr: string) => boolean;

  // User-Scoped Onboarding State & Actions
  isOnboarded: boolean;
  dismissOnboardingBanner: () => void;
  startFromScratch: () => void;
  effectiveUserId: string;

  // Real-time skill injection tracking for UI pulse feedback
  recentlyAddedSkills: string[];
  addRecentlyAddedSkill: (skill: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_V1 = 'resumebuddy_resume_data_v1';
const LOCAL_STORAGE_ALL_RESUMES = 'resumebuddy_all_resumes_v2';
const LOCAL_STORAGE_CURRENT_ID = 'resumebuddy_current_id_v2';
const LOCAL_STORAGE_USER_PROFILE = 'resumebuddy_user_profile_cache';

// Load or extract user profile contact cache
const getStoredUserProfile = (): UserProfileCache => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_PROFILE);
    if (saved) return JSON.parse(saved);

    // If no dedicated cache exists yet, inspect existing resumes for non-sample candidate data
    const savedResumes = localStorage.getItem(LOCAL_STORAGE_ALL_RESUMES);
    if (savedResumes) {
      const parsed = JSON.parse(savedResumes);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const last = parsed[parsed.length - 1];
        if (last?.personal?.fullName && !last.personal.fullName.includes('Alex Morgan')) {
          const profile: UserProfileCache = {
            fullName: last.personal.fullName || '',
            jobTitle: last.personal.jobTitle || '',
            email: last.personal.email || '',
            phone: last.personal.phone || '',
            location: last.personal.location || '',
            website: last.personal.website || '',
            linkedin: last.personal.linkedin || '',
            github: last.personal.github || '',
            photoUrl: last.personal.photoUrl || '',
          };
          localStorage.setItem(LOCAL_STORAGE_USER_PROFILE, JSON.stringify(profile));
          return profile;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load user profile cache:', e);
  }

  return {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    photoUrl: '',
  };
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useGuestAuth();
  const effectiveUserId = user?.id || (isAdminAuthenticated() ? 'admin' : 'guest_local');

  const storageKeyResumes = `resumebuddy_v2_${effectiveUserId}_resumes`;
  const storageKeyActiveId = `resumebuddy_v2_${effectiveUserId}_active_resume_id`;
  const storageKeyProfile = `resumebuddy_v2_${effectiveUserId}_user_profile`;
  const storageKeyOnboarded = `resumebuddy_v2_${effectiveUserId}_onboarded`;

  // Helper to load or initialize user-scoped resume storage
  const loadScopedData = (uid: string) => {
    const keyRes = `resumebuddy_v2_${uid}_resumes`;
    const keyAct = `resumebuddy_v2_${uid}_active_resume_id`;
    const keyProf = `resumebuddy_v2_${uid}_user_profile`;
    const keyOnb = `resumebuddy_v2_${uid}_onboarded`;

    try {
      const saved = localStorage.getItem(keyRes);
      if (saved) {
        const parsed: ResumeData[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedActiveId = localStorage.getItem(keyAct) || parsed[0].id;
          const active = parsed.find((r) => r.id === savedActiveId) || parsed[0];
          let profile: UserProfileCache = {
            fullName: active.personal?.fullName || '',
            jobTitle: active.personal?.jobTitle || '',
            email: active.personal?.email || '',
            phone: active.personal?.phone || '',
            location: active.personal?.location || '',
            website: active.personal?.website || '',
            linkedin: active.personal?.linkedin || '',
            github: active.personal?.github || '',
            photoUrl: active.personal?.photoUrl || '',
          };
          const savedProfile = localStorage.getItem(keyProf);
          if (savedProfile) {
            try {
              profile = JSON.parse(savedProfile);
            } catch {}
          }
          const onboardedVal = localStorage.getItem(keyOnb);
          return {
            resumes: parsed,
            activeId: active.id,
            activeResume: active,
            profile,
            isOnboarded: onboardedVal !== 'false',
          };
        }
      }

      // Legacy fallback for admin if no scoped key exists yet
      if (uid === 'admin') {
        const legacyAll = localStorage.getItem(LOCAL_STORAGE_ALL_RESUMES);
        if (legacyAll) {
          const parsed: ResumeData[] = JSON.parse(legacyAll);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const savedId = localStorage.getItem(LOCAL_STORAGE_CURRENT_ID) || parsed[0].id;
            const active = parsed.find((r) => r.id === savedId) || parsed[0];
            localStorage.setItem(keyRes, JSON.stringify(parsed));
            localStorage.setItem(keyAct, active.id);
            localStorage.setItem(keyOnb, 'true');
            return {
              resumes: parsed,
              activeId: active.id,
              activeResume: active,
              profile: getStoredUserProfile(),
              isOnboarded: true,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[ResumeContext] Failed reading scoped localStorage:', e);
    }

    // Brand new user: pristine clean slate!
    const blank = createBlankResume(undefined, '', '');
    localStorage.setItem(keyRes, JSON.stringify([blank]));
    localStorage.setItem(keyAct, blank.id);
    localStorage.setItem(keyOnb, 'false');

    return {
      resumes: [blank],
      activeId: blank.id,
      activeResume: blank,
      profile: {
        fullName: '',
        jobTitle: '',
        email: user?.email || '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        photoUrl: '',
      },
      isOnboarded: false,
    };
  };

  const initialScoped = loadScopedData(effectiveUserId);
  const [resumes, setResumes] = useState<ResumeData[]>(initialScoped.resumes);
  const [currentResumeId, setCurrentResumeId] = useState<string>(initialScoped.activeId);
  const [resumeData, setResumeData] = useState<ResumeData>(initialScoped.activeResume);
  const [userProfile, setUserProfile] = useState<UserProfileCache>(initialScoped.profile);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(initialScoped.isOnboarded);

  const [activeTab, setActiveTab] = useState<string>('target');
  const [isJdModalOpen, setIsJdModalOpen] = useState<boolean>(false);
  const [recentlyAddedSkills, setRecentlyAddedSkills] = useState<string[]>([]);

  const addRecentlyAddedSkill = React.useCallback((skill: string) => {
    const normalized = skill.trim().toLowerCase();
    if (!normalized) return;
    setRecentlyAddedSkills((prev) => [...prev, normalized]);
    // Keep the "New" pulse badge active for 15 seconds
    setTimeout(() => {
      setRecentlyAddedSkills((prev) => prev.filter((s) => s !== normalized));
    }, 15000);
  }, []);

  // When switching users or logging out, clear and reload scoped memory state
  useEffect(() => {
    const scoped = loadScopedData(effectiveUserId);
    setResumes(scoped.resumes);
    setCurrentResumeId(scoped.activeId);
    setResumeData(scoped.activeResume);
    setUserProfile(scoped.profile);
    setIsOnboarded(scoped.isOnboarded);
    setIsJdModalOpen(false);
  }, [effectiveUserId]);

  // Keep `resumeData` changes synced to the user's scoped resumes array and localStorage
  useEffect(() => {
    setResumes((prevResumes) => {
      const updatedResume = { ...resumeData, updatedAt: Date.now() };
      const exists = prevResumes.some((r) => r.id === resumeData.id);
      let newResumes;
      if (exists) {
        newResumes = prevResumes.map((r) => (r.id === resumeData.id ? updatedResume : r));
      } else {
        newResumes = [...prevResumes, updatedResume];
      }

      try {
        localStorage.setItem(storageKeyResumes, JSON.stringify(newResumes));
        localStorage.setItem(storageKeyActiveId, currentResumeId);
      } catch (e) {
        console.warn('Failed to save to local storage', e);
      }
      return newResumes;
    });
  }, [resumeData, storageKeyResumes, storageKeyActiveId, currentResumeId]);

  // Handle switching active resume properly without infinite loops
  useEffect(() => {
    const target = resumes.find((r) => r.id === currentResumeId);
    if (target && target.id !== resumeData.id) {
      setResumeData(target);
    }
  }, [currentResumeId]);

  // Profile Cache Mutator
  const updateUserProfile = (profileUpdate: Partial<UserProfileCache>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profileUpdate };
      try {
        localStorage.setItem(storageKeyProfile, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to cache user profile:', e);
      }
      return updated;
    });
  };

  const dismissOnboardingBanner = () => {
    localStorage.setItem(storageKeyOnboarded, 'true');
    setIsOnboarded(true);
  };

  const startFromScratch = () => {
    const blank = createBlankResume(userProfile, '', '');
    setResumeData(blank);
    setResumes([blank]);
    setCurrentResumeId(blank.id);
    localStorage.setItem(storageKeyResumes, JSON.stringify([blank]));
    localStorage.setItem(storageKeyActiveId, blank.id);
    localStorage.setItem(storageKeyOnboarded, 'true');
    setIsOnboarded(true);
  };

  // Start Clean Targeted Resume using cached profile info
  const startCleanResumeWithProfile = (roleTitle: string, jdText: string) => {
    const newId = `res-${Date.now()}`;
    const cleanResume = createBlankResume(userProfile, roleTitle, jdText);
    cleanResume.id = newId;
    cleanResume.title = roleTitle ? `${roleTitle} Resume` : 'Targeted Resume';
    
    // Add new clean resume to resumes array and set as active
    setResumes(prev => [...prev, cleanResume]);
    setCurrentResumeId(newId);
    setResumeData(cleanResume);
    setActiveTab('target');
  };

  const clearResumeToBlank = () => {
    const cleanResume = createBlankResume(
      userProfile, 
      resumeData.jobTarget.targetRoleTitle, 
      resumeData.jobTarget.jobDescriptionText
    );
    cleanResume.id = resumeData.id;
    cleanResume.title = resumeData.title;
    setResumeData(cleanResume);
  };

  // Multi-Resume Actions
  const createNewResume = (title = 'New Resume') => {
    const newId = `res-${Date.now()}`;
    const newResume = createBlankResume(userProfile);
    newResume.id = newId;
    newResume.title = title;
    newResume.updatedAt = Date.now();
    
    setResumes(prev => [...prev, newResume]);
    setCurrentResumeId(newId);
  };

  const switchResume = (id: string) => {
    setCurrentResumeId(id);
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (id === currentResumeId) {
        if (filtered.length > 0) {
          setCurrentResumeId(filtered[0].id);
        } else {
          createNewResume('My Resume');
          return prev;
        }
      }
      try {
        localStorage.setItem(storageKeyResumes, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
  };

  const duplicateResume = (id: string) => {
    const toCopy = resumes.find(r => r.id === id);
    if (toCopy) {
      const newId = `res-${Date.now()}`;
      const clone = { ...toCopy, id: newId, title: `${toCopy.title} (Copy)`, updatedAt: Date.now() };
      setResumes(prev => [...prev, clone]);
      setCurrentResumeId(newId);
    }
  };

  const branchResume = (sourceId: string, branchRoleTitle: string, customTitle?: string): string => {
    const toCopy = resumes.find(r => r.id === sourceId) || resumeData;
    const newId = `res-${Date.now()}`;
    const cleanRole = branchRoleTitle.trim();
    const title = customTitle?.trim() || (cleanRole ? `${cleanRole} Resume` : `${toCopy.title} (Branched)`);
    
    // Deep clone source resume to isolate edits while keeping all bullet bank entries
    const branched: ResumeData = JSON.parse(JSON.stringify(toCopy));
    branched.id = newId;
    branched.title = title;
    branched.targetRoleBranch = cleanRole || undefined;
    branched.updatedAt = Date.now();
    if (cleanRole) {
      branched.jobTarget.targetRoleTitle = cleanRole;
    }

    setResumes(prev => [...prev, branched]);
    setCurrentResumeId(newId);
    setResumeData(branched);
    return newId;
  };

  const renameResume = (id: string, newTitle: string) => {
    if (id === currentResumeId) {
      setResumeData(prev => ({ ...prev, title: newTitle }));
    } else {
      setResumes(prev => prev.map(r => r.id === id ? { ...r, title: newTitle, updatedAt: Date.now() } : r));
    }
  };

  // Actions
  const updatePersonal = (personal: Partial<PersonalDetails>) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...personal },
    }));

    // Auto-sync contact details to persistent profile cache
    const contactKeys: (keyof UserProfileCache)[] = [
      'fullName', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'photoUrl'
    ];
    const hasContactUpdate = Object.keys(personal).some(k => contactKeys.includes(k as any));
    if (hasContactUpdate) {
      updateUserProfile(personal as Partial<UserProfileCache>);
    }
  };

  const updateExperienceItem = (id: string, exp: Partial<WorkExperience>) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...exp };

        // Keep bulletBank and highlights in sync
        if (exp.highlights && !exp.bulletBank) {
          const bank = item.bulletBank || [];
          const disabledItems = bank.filter(b => !b.enabled);
          const newEnabledItems = exp.highlights.map((h, i) => {
            const found = bank.find(b => b.text === h);
            return found || { id: `b-${i}-${Date.now()}`, text: h, enabled: true };
          });
          merged.bulletBank = [...newEnabledItems, ...disabledItems];
        } else if (exp.bulletBank && !exp.highlights) {
          merged.highlights = exp.bulletBank.filter(b => b.enabled).map(b => b.text);
        }

        return merged;
      }),
    }));
  };

  const toggleBulletBankItem = (expId: string, bulletId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bank = item.bulletBank && item.bulletBank.length > 0 
          ? item.bulletBank 
          : item.highlights.map((h, i) => ({ id: `b-${i}`, text: h, enabled: true }));
        
        const updatedBank = bank.map((b) => b.id === bulletId ? { ...b, enabled: !b.enabled } : b);
        const updatedHighlights = updatedBank.filter(b => b.enabled).map(b => b.text);

        return {
          ...item,
          bulletBank: updatedBank,
          highlights: updatedHighlights,
        };
      }),
    }));
  };

  const addBulletToBank = (expId: string, text: string) => {
    if (!text.trim()) return;
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bank = item.bulletBank && item.bulletBank.length > 0 
          ? item.bulletBank 
          : item.highlights.map((h, i) => ({ id: `b-${i}`, text: h, enabled: true }));
        
        const newBullet = { 
          id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
          text: text.trim(), 
          enabled: true 
        };
        const updatedBank = [...bank, newBullet];
        const updatedHighlights = updatedBank.filter(b => b.enabled).map(b => b.text);

        return {
          ...item,
          bulletBank: updatedBank,
          highlights: updatedHighlights,
        };
      }),
    }));
  };

  const deleteBulletFromBank = (expId: string, bulletId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bank = item.bulletBank || [];
        const updatedBank = bank.filter(b => b.id !== bulletId);
        const updatedHighlights = updatedBank.filter(b => b.enabled).map(b => b.text);

        return {
          ...item,
          bulletBank: updatedBank,
          highlights: updatedHighlights,
        };
      }),
    }));
  };

  const addExperienceItem = () => {
    const defaultText = 'Key achievement or responsibility with metrics.';
    const newItem: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      isCurrent: true,
      highlights: [defaultText],
      bulletBank: [
        { id: `b-${Date.now()}`, text: defaultText, enabled: true }
      ],
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newItem],
    }));
  };

  const deleteExperienceItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const reorderExperience = (startIndex: number, endIndex: number) => {
    setResumeData((prev) => {
      const list = Array.from(prev.experience);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { ...prev, experience: list };
    });
  };

  const updateEducationItem = (id: string, edu: Partial<Education>) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...edu } : item)),
    }));
  };

  const addEducationItem = () => {
    const newItem: Education = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }));
  };

  const deleteEducationItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const updateSkillCategory = (id: string, cat: Partial<SkillCategory>) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((item) => (item.id === id ? { ...item, ...cat } : item)),
    }));
  };

  const addSkillCategory = () => {
    const newItem: SkillCategory = {
      id: `skill-${Date.now()}`,
      categoryName: 'Technical & Professional Skills',
      skills: [],
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newItem],
    }));
  };

  const deleteSkillCategory = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.id !== id),
    }));
  };

  const updateProjectItem = (id: string, proj: Partial<Project>) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, ...proj } : item)),
    }));
  };

  const addProjectItem = () => {
    const newItem: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      techStack: [],
      highlights: [],
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newItem],
    }));
  };

  const deleteProjectItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const updateCustomSection = (id: string, section: Partial<CustomSection>) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((item) => (item.id === id ? { ...item, ...section } : item)),
    }));
  };

  const addCustomSection = (title = 'Certifications & Honors') => {
    const newItem: CustomSection = {
      id: `custom-${Date.now()}`,
      sectionTitle: title,
      items: [
        {
          id: `item-${Date.now()}`,
          title: '',
          subtitle: '',
          date: '',
          description: '',
        },
      ],
    };
    setResumeData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newItem],
    }));
  };

  const deleteCustomSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((item) => item.id !== id),
    }));
  };

  const updateJobTarget = (roleTitle: string, jdText: string) => {
    setResumeData((prev) => {
      const analyzed = analyzeJobDescription(roleTitle, jdText, prev);
      return {
        ...prev,
        jobTarget: analyzed,
      };
    });
  };

  const updateStyleConfig = (style: Partial<StyleConfig>) => {
    setResumeData((prev) => ({
      ...prev,
      style: { ...prev.style, ...style },
    }));
  };

  const loadSampleData = () => {
    const sample: ResumeData = {
      ...INITIAL_RESUME_DATA,
      id: `res-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setResumeData(sample);
    setResumes([sample]);
    setCurrentResumeId(sample.id);
    localStorage.setItem(storageKeyResumes, JSON.stringify([sample]));
    localStorage.setItem(storageKeyActiveId, sample.id);
    localStorage.setItem(storageKeyOnboarded, 'true');
    setIsOnboarded(true);
  };

  const clearAllData = () => {
    clearResumeToBlank();
  };

  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${resumeData.personal.fullName.replace(/\s+/g, '_') || 'resume'}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.personal && parsed.experience) {
        setResumeData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON structure:', e);
    }
    return false;
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        userProfile,
        updateUserProfile,
        startCleanResumeWithProfile,
        clearResumeToBlank,
        resumes,
        currentResumeId,
        createNewResume,
        switchResume,
        deleteResume,
        duplicateResume,
        branchResume,
        renameResume,
        activeTab,
        setActiveTab,
        isJdModalOpen,
        setIsJdModalOpen,
        updatePersonal,
        updateExperienceItem,
        addExperienceItem,
        deleteExperienceItem,
        reorderExperience,
        toggleBulletBankItem,
        addBulletToBank,
        deleteBulletFromBank,
        updateEducationItem,
        addEducationItem,
        deleteEducationItem,
        updateSkillCategory,
        addSkillCategory,
        deleteSkillCategory,
        updateProjectItem,
        addProjectItem,
        deleteProjectItem,
        updateCustomSection,
        addCustomSection,
        deleteCustomSection,
        updateJobTarget,
        updateStyleConfig,
        loadSampleData,
        clearAllData,
        exportAsJson,
        importFromJson,
        isOnboarded,
        dismissOnboardingBanner,
        startFromScratch,
        effectiveUserId,
        recentlyAddedSkills,
        addRecentlyAddedSkill,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
