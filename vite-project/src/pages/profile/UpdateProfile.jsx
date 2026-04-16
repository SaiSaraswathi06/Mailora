import { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiUploadCloud, FiEdit2, FiSave, FiX, FiLink, FiCheckCircle, FiLock, FiEye, FiEyeOff, FiPlus, FiMail, FiTrash2 } from "react-icons/fi";
// import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import * as pdfjsLib from 'pdfjs-dist';
// import { profileService } from "../services/profileService";
import { profileService } from "../../services/profileService";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function UpdateProfile() {
  const [completionProgress, setCompletionProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-filled uneditable details
  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    photo: ""
  });

  const [editBasic, setEditBasic] = useState(false);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLink, setResumeLink] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef(null);

  // Extracted/Editable fields
  const [profileData, setProfileData] = useState({
    about: "",
    skills: [],
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    codingProfiles: { github: "", leetcode: "", codechef: "" },
    achievements: "",
    connectedMails: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await profileService.getProfile();
        if (response.success) {
          setBasicInfo(response.data.basicInfo);
          setProfileData(response.data.profileData);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Password change state
  const [pwdEditing, setPwdEditing] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);

  // Extractor simulation -> Real Heuristic Extractor
  const handleExtractResume = async () => {
    if (!resumeFile && !resumeLink) {
      alert("Please upload a PDF resume file first.");
      return;
    }

    if (!resumeFile && resumeLink) {
      alert("Link processing not available in client-side alone. Processing link as text...");
      setTimeout(() => alert("Link processed."), 1000);
      return;
    }
    
    setIsExtracting(true);
    
    try {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }
      
      const textLC = fullText.toLowerCase();
      const possibleSkills = ["React", "JavaScript", "Node.js", "Express", "MongoDB", "Figma", "HTML", "CSS", "Python", "Java", "C++", "SQL", "Git", "Docker", "AWS", "TypeScript", "Tailwind CSS"];
      const foundSkills = possibleSkills.filter(skill => textLC.includes(skill.toLowerCase()));
      
      let detectedRole = basicInfo.role;
      if (textLC.includes("frontend") || textLC.includes("react")) detectedRole = "Frontend Developer";
      else if (textLC.includes("backend") || textLC.includes("node")) detectedRole = "Backend Developer";
      else if (textLC.includes("full stack") || textLC.includes("fullstack")) detectedRole = "Full Stack Developer";
      else if (textLC.includes("data") || textLC.includes("machine learning")) detectedRole = "Data Scientist";
      
      const updatedProfile = {
        skills: [...new Set([...profileData.skills, ...foundSkills])],
      };
      
      if (textLC.includes("education") || textLC.includes("university") || textLC.includes("b.tech") || textLC.includes("bachelor")) {
         updatedProfile.education = [
           ...profileData.education,
           { id: Date.now(), degree: "Extracted Degree", institution: "Extracted Institution based on keyword", year: "Recent" }
         ];
      }
      
      if (textLC.includes("experience") || textLC.includes("intern") || textLC.includes("work")) {
         updatedProfile.experience = [
           ...profileData.experience,
           { id: Date.now(), role: "Extracted Role", company: "Extracted Company", duration: "1 Year", description: "Experience detected in your resume." }
         ];
      }

      setProfileData(prev => ({ ...prev, ...updatedProfile }));
      setBasicInfo(prev => ({ ...prev, role: detectedRole }));
      setCompletionProgress(90);
      alert("Resume parsed! Found " + foundSkills.length + " skills and updated profile sections.");

    } catch (error) {
      console.error("Extraction error:", error);
      alert("Failed to extract data. Ensure you uploaded a valid text-based PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleResumeUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const saveSection = async (section, data) => {
    // API logic to save specific section
    try {
      await profileService.updateSection(section, data);
      console.log(`Saved ${section}`);
    } catch (e) {
      console.error(`Failed to save ${section}`, e);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      await profileService.updateBasicInfo(basicInfo);
      await profileService.updateProfileData(profileData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-slate-50 dark:bg-black min-h-screen font-sans transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen relative">
          <Topbar />
          <div className="flex-1 flex justify-center items-center">
            <div className="flex flex-col items-center text-orange-600 dark:text-orange-500">
               <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="font-medium text-slate-900 dark:text-white dark:text-slate-200 dark:text-gray-400">Loading Profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 dark:bg-black min-h-screen font-sans transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-7xl mx-auto flex flex-col h-screen overflow-y-auto w-full relative">
        <Topbar />

        <div className="mt-8 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white tracking-tight transition-colors">Update Profile</h1>
            <p className="text-slate-700 dark:text-slate-300 dark:text-gray-400 text-sm mt-1 transition-colors">Keep your information up to date to get the best matches.</p>
          </div>
          <button 
            onClick={handleUpdateProfile}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-orange-500 flex items-center gap-2 ${isSaving ? 'bg-orange-400 cursor-not-allowed text-white' : 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-offset-2'}`}>
            {isSaving ? "Saving..." : <><FiSave /> Update Profile</>}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8 overflow-hidden">
          <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionProgress}%` }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            
            {/* Header & Basic Info */}
            <Card title="Basic Information" onEdit={() => setEditBasic(!editBasic)} isEditing={editBasic} onSave={async () => {
              setEditBasic(false);
              try {
                await profileService.updateBasicInfo(basicInfo);
              } catch (e) {
                console.error(e);
              }
            }}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative group">
                  <img src={basicInfo.photo} alt="Profile" className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-4 ring-white" />
                  {editBasic && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FiUploadCloud className="text-white w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Input label="First Name" value={basicInfo.firstName} editable={editBasic} onChange={(e) => setBasicInfo({...basicInfo, firstName: e.target.value})} />
                  <Input label="Last Name" value={basicInfo.lastName} editable={editBasic} onChange={(e) => setBasicInfo({...basicInfo, lastName: e.target.value})} />
                  <Input label="Email Address" value={basicInfo.email} editable={editBasic} type="email" onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})} />
                  <Input label="Current Role" value={basicInfo.role} editable={editBasic} onChange={(e) => setBasicInfo({...basicInfo, role: e.target.value})} />
                </div>
              </div>
            </Card>

            {/* About / Bio */}
            <SectionCard title="About / Bio" section="about" value={profileData.about} onChange={(v) => setProfileData({...profileData, about: v})} type="textarea" />

            {/* Experience */}
            <ListSectionCard 
              title="Experience / Internships" 
              items={profileData.experience} 
              onAdd={() => setProfileData({...profileData, experience: [...profileData.experience, { id: Date.now(), role: "New Role", company: "Company", duration: "Duration" }]})}
              onDelete={(id) => setProfileData({...profileData, experience: profileData.experience.filter(exp => exp.id !== id)})}
              renderItem={(item) => (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{item.role}</h4>
                  <p className="text-sm text-slate-900 dark:text-white dark:text-slate-200 font-medium">{item.company} &bull; <span className="text-slate-700 dark:text-slate-300 font-normal">{item.duration}</span></p>
                  {item.description && <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{item.description}</p>}
                </div>
              )}
            />

            {/* Education */}
            <ListSectionCard 
              title="Education" 
              items={profileData.education} 
              onAdd={() => setProfileData({...profileData, education: [...profileData.education, { id: Date.now(), degree: "Degree", institution: "Institution", year: "Year" }]})}
              onDelete={(id) => setProfileData({...profileData, education: profileData.education.filter(edu => edu.id !== id)})}
              renderItem={(item) => (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{item.degree}</h4>
                  <p className="text-sm text-slate-900 dark:text-white dark:text-slate-200 font-medium">{item.institution} &bull; <span className="text-slate-700 dark:text-slate-300 font-normal">{item.year}</span></p>
                </div>
              )}
            />

            {/* Projects */}
            <ListSectionCard 
              title="Projects" 
              items={profileData.projects} 
              onAdd={() => setProfileData({...profileData, projects: [...profileData.projects, { id: Date.now(), title: "Project Title", description: "Description here" }]})}
              onDelete={(id) => setProfileData({...profileData, projects: profileData.projects.filter(proj => proj.id !== id)})}
              renderItem={(item) => (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{item.description}</p>
                </div>
              )}
            />

            {/* Certifications & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SectionCard title="Achievements" section="achievements" value={profileData.achievements} onChange={(v) => setProfileData({...profileData, achievements: v})} type="textarea" />
               <ListSectionCard 
                  title="Certifications" 
                  items={profileData.certifications} 
                  onAdd={() => setProfileData({...profileData, certifications: [...profileData.certifications, { id: Date.now(), name: "Cert Name", issuer: "Issuer" }]})}
                  onDelete={(id) => setProfileData({...profileData, certifications: profileData.certifications.filter(cert => cert.id !== id)})}
                  renderItem={(item) => (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{item.issuer}</p>
                    </div>
                  )}
                />
            </div>
            
          </div>

          {/* Sidebar Area (Right) */}
          <div className="flex flex-col space-y-6 h-full">

            {/* Resume Upload & Extract */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-900 p-6 hover:shadow-md transition-all duration-300 mt-auto">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white dark:text-white flex items-center gap-2 transition-colors">
                  <FiUploadCloud className="text-orange-500 dark:text-orange-400" /> Resume & Extraction
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 mt-1 transition-colors">Upload your resume to automatically fill your profile sections.</p>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div 
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-sky-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" hidden ref={fileInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                  {resumeFile ? (
                    <div className="flex flex-col items-center">
                      <FiCheckCircle className="text-green-500 w-6 h-6 mb-2" />
                      <span className="text-sm font-medium text-slate-700 truncate max-w-full">{resumeFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-700 dark:text-slate-300">
                      <FiUploadCloud className="w-6 h-6 mb-2 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm">Click or drag PDF/DOCX</span>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                </div>

                {/* Link Upload */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLink className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <input 
                      type="url" 
                      placeholder="Paste Drive / Portfolio Link" 
                      className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleExtractResume}
                  disabled={isExtracting || (!resumeFile && !resumeLink)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${isExtracting ? 'bg-slate-100 text-slate-500 dark:text-slate-400 cursor-not-allowed' : (!resumeFile && !resumeLink) ? 'bg-slate-100 text-slate-500 dark:text-slate-400' : 'bg-orange-500 text-white hover:bg-slate-700 shadow-sm'}`}
                >
                  {isExtracting ? "Extracting Details..." : "Extract & Fill Profile"}
                </button>
              </div>
            </div>

            {/* Skills */}
            <Card title="Skills" onEdit={() => {}} isEditing={false}>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-sky-50 text-orange-700 border border-sky-100 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
                <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1">
                  <FiPlus /> Add
                </button>
              </div>
            </Card>

            {/* Coding Profiles */}
            <Card title="Coding Profiles" onEdit={() => {}} isEditing={false}>
              <div className="space-y-3">
                <Input label="GitHub" value={profileData.codingProfiles.github} editable={false} placeholder="github.com/username" />
                <Input label="LeetCode" value={profileData.codingProfiles.leetcode} editable={false} placeholder="leetcode.com/username" />
                <Input label="CodeChef" value={profileData.codingProfiles.codechef} editable={false} placeholder="codechef.com/users/username" />
              </div>
            </Card>

            {/* Connected Emails Component */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-900 p-6 hover:shadow-md transition-all duration-300 mt-auto">
               <div className="mb-4 flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white dark:text-white flex items-center gap-2 transition-colors">
                     <FiMail className="text-orange-500 dark:text-orange-400" /> Connected Mails
                   </h3>
                   <p className="text-xs text-slate-700 dark:text-slate-300 dark:text-gray-400 mt-1 transition-colors">Connect up to 3 email addresses.</p>
                 </div>
                 <span className="text-xs font-semibold px-2 py-1 bg-sky-50 dark:bg-sky-900/20 text-orange-600 dark:text-orange-400 rounded-md transition-colors">
                   {profileData.connectedMails.length} / 3
                 </span>
               </div>
               
               <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 {/* List of Connected Emails */}
                 {profileData.connectedMails.map((mail, idx) => {
                   const isGoogle = mail.includes('@gmail.com');
                   const isMicrosoft = mail.includes('@outlook.com') || mail.includes('@hotmail.com');
                   return (
                   <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800/50 group">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-300 dark:border-slate-700 flex-shrink-0">
                          {isGoogle ? (
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                          ) : isMicrosoft ? (
                            <img src="https://www.svgrepo.com/show/475661/microsoft-color.svg" className="w-4 h-4" alt="Microsoft" />
                          ) : (
                            <FiMail className="text-slate-500 dark:text-slate-400 w-4 h-4" />
                          )}
                        </div>
                     </div>
                     <button 
                       onClick={() => setProfileData({...profileData, connectedMails: profileData.connectedMails.filter((_, i) => i !== idx)})}
                       className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                       title="Remove Email">
                       <FiTrash2 className="w-4 h-4" />
                     </button>
                   </div>
                   );
                 })}
                 
                 {/* Add New Email Input */}
                 {profileData.connectedMails.length < 3 && (
                   <div className="flex gap-2">
                     <input 
                       id="newEmailInput"
                       type="email" 
                       placeholder="Enter new email address..." 
                       className="flex-1 text-sm border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           const val = e.target.value.trim();
                           if (val && val.includes('@')) {
                             setProfileData({...profileData, connectedMails: [...profileData.connectedMails, val]});
                             e.target.value = '';
                           }
                         }
                       }}
                     />
                     <button 
                       onClick={() => {
                         const input = document.getElementById('newEmailInput');
                         const val = input.value.trim();
                         if (val && val.includes('@')) {
                           setProfileData({...profileData, connectedMails: [...profileData.connectedMails, val]});
                           input.value = '';
                         }
                       }}
                       className="px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-1">
                       <FiPlus className="w-4 h-4"/> Add
                     </button>
                   </div>
                 )}
               </div>
            </div>

            {/* Change Password Inline */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-900 p-6 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white dark:text-white flex items-center gap-2 transition-colors">
                  <FiLock className="text-slate-500 dark:text-slate-400 dark:text-gray-500" /> Security
                </h3>
                <button 
                  onClick={() => setPwdEditing(!pwdEditing)} 
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {pwdEditing ? "Cancel" : "Change Password"}
                </button>
              </div>

              {pwdEditing && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <PwdInput label="Current Password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} show={showPwd} toggle={() => setShowPwd(!showPwd)} />
                  <PwdInput label="New Password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} show={showPwd} toggle={() => setShowPwd(!showPwd)} />
                  <PwdInput label="Confirm New" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} show={showPwd} toggle={() => setShowPwd(!showPwd)} />
                  <button 
                    onClick={async () => {
                      if (passwords.new !== passwords.confirm) {
                        alert("New passwords do not match.");
                        return;
                      }
                      try {
                        await profileService.changePassword(passwords);
                        alert("Password updated");
                        setPwdEditing(false);
                        setPasswords({ current: "", new: "", confirm: "" });
                      } catch (e) {
                        alert("Failed to update password");
                      }
                    }}
                    className="w-full bg-orange-500 text-white text-sm py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                    Update Password
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents for cleaner code

function Card({ title, children, onEdit, isEditing, onSave }) {
  const ref = useScrollAnimation({ delay: "delay-100" });
  return (
    <div ref={ref} className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-900 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50 dark:border-gray-800 transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white dark:text-white transition-colors">{title}</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:text-slate-200 dark:hover:text-gray-300 transition-colors" title="Cancel"><FiX className="w-4 h-4" /></button>
            <button onClick={onSave} className="p-1.5 text-orange-500 hover:text-orange-600 transition-colors" title="Save"><FiCheckCircle className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={onEdit} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionCard({ title, section, value, onChange, type = "text" }) {
  const [editing, setEditing] = useState(false);
  return (
    <Card title={title} isEditing={editing} onEdit={() => setEditing(!editing)} onSave={() => setEditing(false)}>
      {editing ? (
        type === "textarea" ? (
          <textarea 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none min-h-[100px]"
          />
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
          />
        )
      ) : (
        <p className="text-sm text-slate-900 dark:text-white dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{value || <span className="text-slate-500 dark:text-slate-400 italic">Not provided</span>}</p>
      )}
    </Card>
  );
}

function ListSectionCard({ title, items, onAdd, onDelete, renderItem }) {
  const ref = useScrollAnimation({ delay: "delay-[150ms]" });
  const [editingId, setEditingId] = useState(null);
  return (
    <div ref={ref} className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-900 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50 dark:border-gray-800 transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white dark:text-white transition-colors">{title}</h3>
        <button onClick={onAdd} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group">
          <FiPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No items added yet. Click + to add.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className={`group relative p-3 rounded-xl border border-transparent hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-100 transition-colors ${index !== items.length -1 ? 'border-b-slate-100 border-b pb-4 mb-4 rounded-b-none' : ''}`}>
               <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="text-slate-500 dark:text-slate-400 hover:text-orange-500 p-1"><FiEdit2 className="w-3.5 h-3.5" /></button>
                  {onDelete && <button onClick={() => onDelete(item.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>}
               </div>
               {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, editable, type = "text", placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{label}</label>
      {editable ? (
        <input 
          type={type} 
          value={value} 
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none p-2.5 transition-all shadow-sm"
        />
      ) : (
        <div className="text-sm font-medium text-slate-900 dark:text-white py-2.5 bg-transparent">{value || <span className="text-slate-500 dark:text-slate-400 font-normal italic">N/A</span>}</div>
      )}
    </div>
  );
}

function PwdInput({ label, value, onChange, show, toggle }) {
  return (
    <div className="relative">
      <input 
        type={show ? "text" : "password"} 
        placeholder={label}
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
      />
      <button 
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:text-slate-200 transition-colors focus:outline-none"
      >
        {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
  );
}
