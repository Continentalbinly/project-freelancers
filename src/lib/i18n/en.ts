import { sign } from "crypto";
import { mark } from "framer-motion/client";
import { redirect } from "next/dist/server/api-utils";

const en = {
  language: "English",
  welcome: "Welcome",
  cookies: "Cookie Policy",
  customize: "Customize",
  learnMore: "Learn more",
  common: {
    loading: "Loading...",
    loadingUser: "Loading information...",
    cancel: "Cancel",
    processing: "Processing...",
    samples: "Samples",
    noRating: "No ratings yet",
    noNotes: "No notes",
    confirm: "Confirm",
    draftLoaded: "Loading Draft...",
    status: {
      statusOpen: "Open",
      statusInProgress: "In Progress",
      statusInReview: "In Review",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
    },
    filters: "Filters",
    hideFilters: "Hide filters",
    createdAt: "Created at",
    signIn: "Sign In",
    edit: "Edit",
    save: "Save",
    modal: {
      success: "Success",
    },
    accept: "Accept",
    reject: "Reject",
    ProjectNotFound: "Project not found.",
  },
  // Cookie consent translations
  cookieConsent: {
    bannerTitle: "We use cookies to improve your experience",
    bannerDesc:
      "We use cookies to make our website work properly, analyze usage, and enhance your experience. By using this site, you accept our use of cookies.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    preferences: "Cookie preferences",
    essentialCookies: "Essential cookies",
    essentialCookiesDesc: "Necessary for the website to function properly",
    essentialCookiesDetail:
      "These cookies are required for the website to work and cannot be disabled.",
    performanceCookies: "Performance cookies",
    performanceCookiesDesc:
      "Help us understand how visitors interact with our site",
    performanceCookiesDetail:
      "These cookies help us analyze site usage to improve our services.",
    functionalityCookies: "Functionality cookies",
    functionalityCookiesDesc: "Remember your settings and preferences",
    functionalityCookiesDetail:
      "These cookies allow the site to remember your choices for a better experience.",
    targetingCookies: "Targeting cookies",
    targetingCookiesDesc: "Used to deliver relevant advertising",
    targetingCookiesDetail:
      "These cookies may be set by our advertising partners to build a profile of your interests.",
    savePreferences: "Save preferences",
    policyLink:
      "You can change your cookie settings at any time in our cookie policy",
  },
  // Header translations
  header: {
    home: "Home",
    projects: "Projects",
    proposals: "Proposals",
    messages: "Messages",
    about: "About",
    freelancers: "Freelancers",
    clients: "Clients",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    searchProjects: "Search projects",
    search: "Search",
    filters: "Filters",
    clearFilters: "Clear filters",
    searchPlaceholder: "Search projects, skills, or keywords...",
    category: "Category",
    budgetRange: "Budget range",
    status: "Status",
    allCategories: "All categories",
    allTypes: "All types",
    allStatus: "All status",
    webDevelopment: "Web Development",
    mobileDevelopment: "Mobile Development",
    design: "Design",
    writing: "Writing",
    research: "Research",
    dataAnalysis: "Data Analysis",
    marketing: "Marketing",
    translation: "Translation",
    other: "Other",
    fixedPrice: "Fixed price",
    hourlyRate: "Hourly rate",
    open: "Open",
    inProgress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    freelancer: "Freelancer",
    client: "Client",
    member: "Member",
    credit: "Credit",
    topUp: "Top-Up",
    transactions: "Transactions",
    withdraw: "Withdraw",
    balance: "Balance",
    adminPanel: "Admin Panel",
    myProjects: "My Projects",
    account: "Account",
    projectManage: "Manage Projects",
  },
  // Footer translations
  footer: {
    companyDescription:
      "The largest academic freelancing community where students can earn income while studying.",
    platform: "Platform",
    browseProjects: "Browse Projects",
    findFreelancers: "Find Freelancers",
    forClients: "For Clients",
    howItWorks: "How it Works",
    pricing: "Pricing",
    support: "Support",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    faq: "FAQ",
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    contact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
    copyright: "© 2025 UniJobs. All rights reserved.",
  },
  contact: {
    title: "Contact Us",
    subtitle:
      "Have questions or need support? We are here to help you succeed on UniJobs.",
    sendMessage: "Send us a message",
    successTitle: "Message sent successfully!",
    successMessage:
      "Thank you for contacting us. We will get back to you within 24 hours.",
    sendAnother: "Send another message",
    fullName: "Full Name *",
    fullNamePlaceholder: "Enter your full name",
    email: "Email Address *",
    emailPlaceholder: "Enter your email address",
    subject: "Subject *",
    subjectPlaceholder: "What is this about?",
    message: "Message *",
    messagePlaceholder: "Tell us how we can help you...",
    sending: "Sending...",
    sendMessageButton: "Send Message",
    getInTouch: "Get in touch",
    emailSupport: "Email",
    emailAddress: "support@UniJobs.com",
    emailResponse: "We usually respond within 24 hours",
    phoneSupport: "Phone",
    phoneNumber: "+1 (555) 123-4567",
    phoneHours: "Mon - Fri, 9:00 - 18:00 EST",
    officeAddress: "Office Address",
    officeLocation:
      "123 Education Road\nUniversity District\nCity, State 12345",
    officeNote: "By appointment only",
    quickHelp: "Quick Help",
    quickHelpDesc:
      "Check our FAQ section for answers to common questions about using UniJobs.",
    viewFaq: "View FAQ →",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find quick answers to common questions about UniJobs",
    faqStudentTitle: "How do I get started as a student?",
    faqStudentAnswer:
      "Just sign up, create your profile, browse available projects, and submit proposals to clients.",
    faqTeacherTitle: "How do I post a project as a teacher?",
    faqTeacherAnswer:
      'Create an account, go to "Post Project", fill in the details, and wait for student proposals.',
    faqPaymentTitle: "How are payments handled?",
    faqPaymentAnswer:
      "We use secure payment processing. Funds are held until the project is completed and approved.",
    faqDisputeTitle: "What if I am not satisfied with the work?",
    faqDisputeAnswer:
      "We have a dispute resolution process. Contact our support team for assistance.",
    viewAllFaq: "View all FAQ",
  },
  // About page translations
  aboutPage: {
    title: "About UniJobs",
    subtitle:
      "The largest professional freelance community where students can earn income while studying",
    mission: {
      title: "Our Mission",
      paragraph1:
        "UniJobs was founded with a simple but powerful mission: to create the largest community where university students can earn income while gaining valuable real-world experience.",
      paragraph2:
        "We believe that students shouldn't have to choose between earning income and gaining valuable experience. Our platform provides both, while creating a vibrant community of learners, creators, and opportunity seekers.",
      paragraph3:
        "By creating this ecosystem, we haven't just helped freelancing—we've created meaningful connections that benefit students, teachers, and entire academic communities, ultimately strengthening the future workforce.",
      values: {
        title: "Our Values",
        quality: {
          title: "Quality",
          description:
            "We maintain high standards for both students and teachers to ensure effective results.",
        },
        community: {
          title: "Community",
          description:
            "Create a supportive network where students and teachers can grow together.",
        },
        trust: {
          title: "Trust",
          description:
            "Secure payments and transparent processes build trust between all parties.",
        },
      },
    },
    impact: {
      title: "Our Impact",
      subtitle:
        "See how UniJobs is making a difference in academic communities",
      freelancers: "Freelancers",
      clients: "Clients",
      projects: "Projects",
      earned: "Earnings",
    },
    team: {
      title: "Our Team",
      subtitle: "Meet the team passionate about professional freelance work",
      members: {
        anousone: {
          name: "Anousone Vongphachan",
          role: "Founder & CEO",
          description:
            "Visionary leader passionate about connecting freelancers and clients. Driving innovation in the freelance market.",
        },
        thipphasone: {
          name: "Thipphasone Chanthabandith",
          role: "Co-founder & CTO",
          description:
            "Technology expert and co-founder focused on creating scalable, secure platforms that empower the future of freelance work.",
        },
        thidaphone: {
          name: "Thidaphone Houngyachith",
          role: "Co-founder & Head of Operations",
          description:
            "Operations expert and co-founder focused on creating smooth experiences and building strong relationships in the community.",
        },
      },
    },
    story: {
      title: "Our Story",
      paragraph1:
        "UniJobs was born from a simple observation: university students wanted real-world experience and income, while teachers wanted quality work done efficiently.",
      paragraph2:
        "Our founder, a former university professor, noticed that many talented students were struggling to find opportunities that aligned with their academic goals. At the same time, colleagues were seeking trusted help with research, projects, and administrative work.",
      paragraph3:
        "This led to the creation of UniJobs—a platform that not only connects these two groups but also ensures quality, security, and mutual benefit. Today, we're proud to serve thousands of students and teachers in academic communities.",
      beliefs: {
        title: "What We Believe",
        belief1:
          "Every student deserves the opportunity to earn while learning",
        belief2: "Quality work should be accessible and affordable",
        belief3: "Education and work experience should complement each other",
        belief4: "Building strong professional communities benefits everyone",
      },
    },
    cta: {
      title: "Join Our Community",
      subtitle:
        "Be part of the movement that's revolutionizing how students and teachers work together.",
      joinAsFreelancer: "Join as Freelancer",
      joinAsClient: "Join as Client",
    },
  },
  // Careers page translations
  careers: {
    title: "Join Our Team",
    subtitle:
      "Help us build the future of professional freelance work and create the largest community where students earn and learn",
    mission: {
      title: "Our Mission",
      paragraph1:
        "At UniJobs, we're passionate about creating the largest community where students can earn income while gaining real-world experience. We believe that every student deserves the opportunity to earn while learning, and every opportunity should contribute to their growth.",
      paragraph2:
        "Our platform creates a vibrant ecosystem where students, teachers, and opportunities come together, building communities that support professional growth and career development.",
      paragraph3:
        "Join us in revolutionizing how students access education and develop their careers, creating learning that is accessible, practical, and valuable for everyone involved.",
      whyWorkWithUs: {
        title: "Why Work With Us?",
        innovation: {
          title: "Innovation",
          description:
            "Work with cutting-edge technology that's transforming education and freelance work.",
        },
        impact: {
          title: "Impact",
          description:
            "Make a real difference in students' lives and the future of education.",
        },
        flexibility: {
          title: "Flexibility",
          description:
            "Remote-first culture with flexible hours and work-life balance.",
        },
      },
    },
    openPositions: {
      title: "Open Positions",
      subtitle:
        "Join our growing team and help build the future of professional freelance work",
      noPositions: {
        title: "No Open Positions",
        subtitle:
          "We're not hiring at the moment, but we're always looking for talented individuals",
        description:
          "While we don't have any positions open right now, we're always interested in hearing from individuals who are passionate about making a difference in education and technology.",
        contactUs: "Contact Us",
        sendResume: "Send Resume",
      },
    },
    benefits: {
      title: "Benefits & Perks",
      subtitle:
        "We believe in taking care of our team so they can do their best work",
      competitiveSalary: {
        title: "Competitive Salary",
        description:
          "Comprehensive compensation packages with equity options for full-time positions.",
      },
      remoteFirst: {
        title: "Remote-First",
        description:
          "Work from anywhere with flexible hours and remote-friendly culture.",
      },
      healthWellness: {
        title: "Health & Wellness",
        description:
          "Comprehensive health insurance and wellness programs for you and your family.",
      },
      learningGrowth: {
        title: "Learning & Growth",
        description:
          "Continuous learning opportunities, conferences, and career development.",
      },
      teamEvents: {
        title: "Team Events",
        description:
          "Regular team building activities, remote events, and annual retreats.",
      },
      flexiblePto: {
        title: "Flexible PTO",
        description:
          "Generous paid time off with unlimited sick days and mental health days.",
      },
    },
    culture: {
      title: "Our Culture",
      subtitle:
        "We believe in creating an environment where everyone can thrive and make meaningful impact",
      innovation: {
        title: "Innovation",
        description:
          "We encourage creative thinking and experimentation to solve complex problems.",
      },
      collaboration: {
        title: "Collaboration",
        description:
          "We work together, share knowledge, and support each other's growth.",
      },
      impact: {
        title: "Impact",
        description:
          "We focus on making a real difference in students' and teachers' lives.",
      },
      diversity: {
        title: "Diversity",
        description:
          "We celebrate different perspectives and create an inclusive environment.",
      },
    },
    cta: {
      title: "Ready to Join Our Team?",
      subtitle:
        "Don't see a position that fits? We're always looking for talented individuals who are passionate about education and technology.",
      contactUs: "Contact Us",
      sendResume: "Send Resume",
    },
  },
  // Auth pages translations
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      signingIn: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      redirecting: "Redirecting...",
      verifyEmailMsg: "Please verify your email to continue.",
      errors: {
        loginFailed: "Login failed",
        unexpectedError: "An unexpected error occurred",
      },
      error: {
        "invalid-credential": "Incorrect email or password. Please try again.",
        "user-not-found": "No account found with this email.",
        "wrong-password": "Incorrect password. Please try again.",
        "invalid-email": "Invalid email address format.",
        "too-many-requests":
          "Too many login attempts. Please wait and try again later.",
        "missing-password": "Please enter your password.",
        "network-request-failed":
          "Network error. Please check your internet connection.",
        unknown: "Email or password is incorrect. Please try again.",
      },
    },
    signup: {
      title: "Create Your Account",
      subtitle: "Join UniJobs to connect with opportunities",
      step1: {
        title: "Basic Information",
        subtitle: "Tell us about yourself",
        fullName: "Full Name *",
        fullNamePlaceholder: "Enter your full name",
        email: "Email Address *",
        emailPlaceholder: "Enter your email",
        password: "Password *",
        confirmPassword: "Confirm Password *",
        confirmPasswordPlaceholder: "Re-enter your password",
        passwordsDoNotMatch: "Passwords do not match",
        passwordPlaceholder: "Create a password",
        passwordHint: "Password must be at least 6 characters",
        roleTitle: "I want to be *",
        freelancer: {
          title: "Freelancer (Find Work)",
          description:
            "Find freelance opportunities and earn income while working",
        },
        client: {
          title: "Client (Post Work)",
          description: "Post projects and hire talented freelancers",
        },
        roleError: "Please select at least 1 role",
        profilePicture: "Profile Picture (Optional)",
        chooseImage: "Choose Image",
        imageHint: "JPG, PNG, GIF, WebP up to 5MB",
        change: "Change",
        remove: "Remove",
        uploading: "Uploading image...",
        benefits: {
          freelancer: {
            title: "🎓 Freelancer Benefits",
            subtitle: "As a freelancer:",
            items: [
              "Find freelance work from clients",
              "Build your portfolio and skills",
              "Earn income while working",
              "Flexible working hours",
            ],
          },
          client: {
            title: "👨‍🏫 Client Benefits",
            subtitle: "As a client:",
            items: [
              "Post projects and assignments",
              "Find talented freelancers",
              "Get help with research and work",
              "Support freelancer development",
            ],
          },
          dual: {
            title: "✨ Your Benefits",
            subtitle: "Dual role benefits:",
            items: [
              "Seamlessly switch between roles",
              "Collaborate with other freelancers",
              "Hire help for your own projects",
            ],
          },
        },
        redirecting: "Redirecting...",
      },
      step2: {
        title: "Personal Information",
        subtitle: "Tell us more about yourself",
        dateOfBirth: "Date of Birth *",
        gender: "Gender *",
        genderOptions: {
          preferNotToSay: "Prefer not to say",
          male: "Male",
          female: "Female",
          other: "Other",
        },
        phone: "Phone Number *",
        phonePlaceholder: "Enter your phone number",
        country: "Country",
        countryPlaceholder: "Enter your country",
        city: "City",
        cityPlaceholder: "Enter your city",
        userCategory: {
          title: "What type of freelancer are you?",
          student: {
            title: "Student",
            description:
              "I am currently studying and want to earn income while learning",
          },
          worker: {
            title: "Professional Worker",
            description:
              "I am a working professional with experience in my field",
          },
          freelancer: {
            title: "Freelancer (Online/Independent)",
            description:
              "I work online or independently (not a student or company worker)",
          },
        },
        studentInfo: {
          title: "Student Information",
          university: "University/Institution",
          universityPlaceholder: "Enter your university or institution",
          fieldOfStudy: "Field of Study",
          fieldOfStudyPlaceholder: "Enter your field of study",
          graduationYear: "Graduation Year",
          graduationYearPlaceholder: "2025",
          bio: "Bio",
          bioPlaceholder:
            "Tell us about your background, interests, and goals...",
          hourlyRate: "Hourly Rate (LAK)",
          hourlyRatePlaceholder: "300000",
          hourlyRateHint: "Enter hourly rate in Lao Kip (₭)",
          skills: "Skills",
          addSkill: "Add Skill",
          addSkillButton: "Add",
        },
        pureFreelancerInfo: {
          title: "Freelancer Information",
          bio: "Bio",
          bioPlaceholder:
            "Tell us about your freelance experience and skills...",
          hourlyRate: "Hourly Rate (LAK)",
          hourlyRatePlaceholder: "300000",
          hourlyRateHint: "Enter hourly rate in Lao Kip (₭)",
          skills: "Skills",
          addSkill: "Add Skill",
          addSkillButton: "Add",
        },
        clientInfo: {
          title: "Client Information",
          institution: "Institution",
          institutionPlaceholder: "Enter your institution",
          department: "Department",
          departmentPlaceholder: "Enter your department",
          position: "Position",
          positionPlaceholder: "e.g., Professor, Teacher",
          yearsOfExperience: "Years of Experience",
          yearsOfExperiencePlaceholder: "5",
        },
        workerInfo: {
          title: "Professional Information",
          company: "Company/Organization",
          companyPlaceholder: "Enter your company name",
          department: "Department",
          departmentPlaceholder: "Enter your department",
          position: "Job Position",
          positionPlaceholder: "e.g., Software Engineer, Designer",
          yearsOfExperience: "Years of Experience",
          yearsOfExperiencePlaceholder: "5",
          bio: "Professional Bio",
          bioPlaceholder:
            "Tell us about your professional experience and expertise...",
          hourlyRate: "Hourly Rate (LAK)",
          hourlyRatePlaceholder: "500000",
          hourlyRateHint: "Enter hourly rate in Lao Kip (₭)",
          skills: "Professional Skills",
          addSkill: "Add Skill",
          addSkillButton: "Add",
        },
        freelancerInfo: {
          title: "Student Information",
          university: "University/Institution",
          universityPlaceholder: "Enter your university or institution",
          fieldOfStudy: "Field of Study",
          fieldOfStudyPlaceholder: "Enter your field of study",
          graduationYear: "Graduation Year",
          graduationYearPlaceholder: "2025",
          bio: "Bio",
          bioPlaceholder:
            "Tell us about your background, interests, and goals...",
          hourlyRate: "Hourly Rate (LAK)",
          hourlyRatePlaceholder: "200000",
          hourlyRateHint: "Enter hourly rate in Lao Kip (₭)",
          skills: "Skills",
          addSkill: "Add Skill",
          addSkillButton: "Add",
        },
        clientCategory: {
          title: "What type of client are you?",
          teacher: {
            title: "Teacher",
            description:
              "I am a teacher or academic who wants to post projects and hire freelancers.",
          },
          worker: {
            title: "Professional Worker",
            description:
              "I am a working professional or business looking to hire freelancers.",
          },
          freelancer: {
            title: "Freelancer (Client)",
            description:
              "I am a freelancer who also wants to post projects and hire others.",
          },
        },
      },
      step3: {
        title: "Terms & Conditions",
        subtitle: "Please review and accept our terms",
        termsOfService: {
          label:
            "I agree to the Terms of Service and understand that I am responsible for my account and activities on the platform. *",
          link: "Terms of Service",
        },
        privacyPolicy: {
          label:
            "I have read and accept the Privacy Policy and consent to the storage and use of my personal data. *",
          link: "Privacy Policy",
        },
        marketingEmails: {
          label:
            "I would like to receive marketing emails about new features, opportunities, and platform updates. (Optional)",
        },
      },
      navigation: {
        previous: "Previous",
        next: "Next",
        createAccount: "Create Account",
        creatingAccount: "Creating Account...",
      },
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign In",
      errors: {
        signupFailed: "Signup failed",
        unexpectedError: "An unexpected error occurred",
        uploadFailed: "Image upload failed",
        invalidFileType:
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
        fileTooLarge: "File size too large. Maximum size is 5MB.",
      },
    },
    verifyEmail: {
      title: "Check your email",
      subtitle: "We've sent a verification link to",
      whatsNextTitle: "What's next?",
      checking: "Checking...",
      steps: {
        checkInbox: "Check your email inbox (and spam folder)",
        clickLink: "Click the verification link in the email",
        returnToLogin: "Return here to sign in to your account",
      },
      buttons: {
        resend: "Resend verification email",
        sending: "Sending...",
        goHome: "Go to Home",
      },
      alreadyVerified: "Already verified?",
      signIn: "Sign in",
      success: {
        sent: "Verification email sent successfully!",
      },
      errors: {
        noUser: "No user found. Please sign in again.",
        failedToSend: "Failed to send verification email.",
      },
    },
  },
  // Auth layout translations
  authLayout: {
    title: "UniJobs",
    subtitle: "Where students can earn while learning.",
  },
  // Help page translations
  help: {
    hero: {
      title: "Help Center",
      subtitle: "Everything you need to know about using UniJobs effectively",
    },
    quickHelp: {
      title: "Quick Help",
      subtitle: "Find the help you need quickly",
    },
    sections: {
      gettingStarted: {
        title: "Getting Started",
        description:
          "New to UniJobs? Learn the basics and get started quickly.",
        link: "Learn More →",
      },
      forFreelancers: {
        title: "For Freelancers",
        description:
          "Complete guide for freelancers to find projects, submit proposals, and get paid.",
        link: "Freelancer Guide →",
      },
      forClients: {
        title: "For Clients",
        description:
          "Learn how to post projects, review proposals, and manage your projects efficiently.",
        link: "Client Guide →",
      },
      payments: {
        title: "Payments & Billing",
        description:
          "Understand how payments work, fees, and how to manage your billing information.",
        link: "Payment Guide →",
      },
      safety: {
        title: "Safety & Security",
        description:
          "Learn about our safety measures and how to stay safe while using the platform.",
        link: "Safety Guide →",
      },
      troubleshooting: {
        title: "Troubleshooting",
        description:
          "Common issues and solutions. Find quick answers to technical problems.",
        link: "Troubleshoot →",
      },
    },
    videoTutorials: {
      title: "Video Tutorials",
      subtitle: "Watch step-by-step guides to master UniJobs",
      tutorials: {
        gettingStarted: {
          title: "Getting Started Guide",
          description:
            "Complete walkthrough of creating an account and setting up your profile.",
          duration: "Duration: 5 minutes",
        },
        postProject: {
          title: "How to Post a Project",
          description:
            "Learn how to create compelling project descriptions that attract the right freelancers.",
          duration: "Duration: 8 minutes",
        },
        submittingProposals: {
          title: "Submitting Proposals",
          description:
            "Tips for writing winning proposals that stand out to clients.",
          duration: "Duration: 6 minutes",
        },
      },
      comingSoon: "Videos coming soon",
    },
    contactSupport: {
      title: "Need Additional Help?",
      subtitle:
        "Can't find what you're looking for? Our support team is here to help you succeed.",
      contactSupport: "Contact Support",
      viewFaq: "View FAQ",
    },
  },
  // FAQ page translations
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about UniJobs",
    categories: {
      all: "All Questions",
      general: "General",
      freelancers: "For Freelancers",
      clients: "For Clients",
      payments: "Payments",
      technical: "Technical",
    },
    noResults:
      "No questions found for this category. Try selecting a different category.",
    contactSection: {
      title: "Still Have Questions?",
      subtitle:
        "Can't find the answer you're looking for? Our support team is here to help.",
      contactSupport: "Contact Support",
      helpCenter: "Help Center",
    },
    questions: {
      // General Questions
      whatIsUniJobs: {
        question: "What is UniJobs?",
        answer:
          "UniJobs is the largest professional freelance community where students can earn income while gaining real-world experience. Students can find opportunities that align with their studies, build portfolios, and develop their skills while earning income to support their education.",
      },
      howDoesItWork: {
        question: "How does UniJobs work?",
        answer:
          "Clients post projects with requirements and budget. Freelancers browse available projects, submit proposals, and work on selected projects. Payments are handled securely through our payment system.",
      },
      isItFree: {
        question: "Is UniJobs free to use?",
        answer:
          "Yes, joining UniJobs is completely free. We only charge a small fee on completed projects to maintain the platform and provide support.",
      },
      projectTypes: {
        question: "What types of projects are available?",
        answer:
          "Projects range from research assistance and data analysis to programming, design, translation, teaching, and administrative work. All projects focus on academic and professional development for students.",
      },
      // Freelancer Questions
      howToStartAsFreelancer: {
        question: "How do I get started as a freelancer?",
        answer:
          "Register for a free account, create your profile with skills and experience, browse available projects, and submit proposals to clients. Once hired, you can start working and earning income.",
      },
      whatSkillsNeeded: {
        question: "What skills do I need to join?",
        answer:
          "You must be a current university student with relevant skills for the projects you want to work on. Common skills include research, writing, programming, design, data analysis, and language abilities.",
      },
      howMuchCanIEarn: {
        question: "How much can I earn as a freelancer?",
        answer:
          "Earnings vary by project type, complexity, and your skills. Freelancers typically earn 250,000-1,500,000 Kip per hour or 500,000-1,000,000 Kip per project, depending on available work.",
      },
      howDoIGetPaid: {
        question: "How do I get paid?",
        answer:
          "Payments are handled securely through our platform. When projects are completed and approved by clients, funds are released to your account. You can withdraw to bank account or PayPal.",
      },
      whatIfICantComplete: {
        question: "What if I can't complete a project?",
        answer:
          "Communication is key. If you encounter issues, contact the client immediately. We have dispute resolution processes, and early communication often prevents problems.",
      },
      // Client Questions
      howToPostProject: {
        question: "How do I post a project as a client?",
        answer:
          "Create an account, go to 'Post Project', add project details including requirements, budget, and timeline. Freelancers will submit proposals, and you can choose the best candidates.",
      },
      howToChooseFreelancer: {
        question: "How do I choose the right freelancer?",
        answer:
          "Review freelancer profiles, portfolios, ratings, and previous work. Look for freelancers with relevant skills and experience. You can also ask questions during the proposal process.",
      },
      whatIfNotSatisfied: {
        question: "What if I'm not satisfied with the work?",
        answer:
          "Contact our support team immediately. We have dispute resolution processes, and we'll work with both parties to find a satisfactory solution.",
      },
      howMuchToBudget: {
        question: "How much should I budget for a project?",
        answer:
          "Budgets vary by project type and complexity. Research projects typically cost 100,000-800,000 Kip, programming projects 200,000-1,500,000 Kip, and design projects 75,000-500,000 Kip. Consider scope and timeline.",
      },
      canIHireSameFreelancer: {
        question: "Can I hire the same freelancer again?",
        answer:
          "Yes! If you're satisfied with a freelancer's work, you can hire them for future projects. Many clients build long-term relationships with trusted freelancers.",
      },
      // Payment Questions
      howDoPaymentsWork: {
        question: "How do payments work?",
        answer:
          "We use an escrow payment system. When you hire a freelancer, funds are held securely until the project is completed and you're satisfied. This protects both parties.",
      },
      whatPaymentMethods: {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit cards, PayPal, and bank transfers. All payments are handled securely through our platform.",
      },
      whenDoFreelancersGetPaid: {
        question: "When do freelancers get paid?",
        answer:
          "Freelancers get paid when projects are completed and approved by clients. This typically happens within 24-48 hours after project completion.",
      },
      areThereFees: {
        question: "Are there any fees?",
        answer:
          "We charge a small fee (typically 5-10%) on completed projects to maintain the platform, provide support, and ensure secure transactions.",
      },
      // Technical Questions
      technicalIssues: {
        question: "What if I have technical issues?",
        answer:
          "Contact our support team at support@UniJobs.com or use the live chat feature during business hours. We typically respond within 24 hours.",
      },
      isDataSecure: {
        question: "Is my data secure?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your personal data and project information. We never share your data with third parties.",
      },
      canIUseOnMobile: {
        question: "Can I use UniJobs on mobile?",
        answer:
          "Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can browse projects, submit proposals, and manage your account from anywhere.",
      },
      howToUpdateProfile: {
        question: "How do I update my profile?",
        answer:
          "Go to your dashboard, click on 'Profile', and you can update your information, skills, portfolio, and settings anytime.",
      },
    },
  },
  // Pricing page translations
  pricing: {
    hero: {
      title: "Pricing",
      subtitle: "Simple, transparent pricing that works for everyone",
    },
    launchPhase: {
      badge: "🎉 Launch Phase",
      title: "Currently Free for Everyone",
      subtitle:
        "We're in our initial launch phase, which means all features are completely free for both freelancers and clients. Take advantage of this opportunity to build your portfolio and find great opportunities.",
      notice: {
        title: "🚀 First Launch Notice",
        message:
          "The fee for making the website live is FREE until the next phase! This is part of our website roadmap plan.",
        details:
          "During this launch phase, we're offering all premium features at no cost to help build our community and gather feedback.",
      },
      currentPlan: {
        price: "Free",
        period: "Launch Phase",
        description: "No fees, no commissions, no hidden costs",
      },
      forFreelancers: {
        title: "For Freelancers",
        features: [
          "Create unlimited proposals",
          "Access all project categories",
          "Keep 100% of your earnings",
          "Build your portfolio",
          "Direct client communication",
        ],
      },
      forClients: {
        title: "For Clients",
        features: [
          "Post unlimited projects",
          "Browse freelancer profiles",
          "No platform fees",
          "Secure payment system",
          "Quality assurance",
        ],
      },
      cta: "Get Started Free",
    },
    futurePlans: {
      title: "Future Pricing Plans",
      subtitle:
        "As we grow and add more features, we'll introduce premium plans while keeping the core platform accessible to everyone.",
      basic: {
        title: "Basic",
        price: "Free",
        period: "Forever",
        features: [
          "Core platform features",
          "Basic support",
          "Standard project limits",
        ],
      },
      pro: {
        title: "Pro",
        price: "₭50K",
        period: "per month",
        badge: "Coming Soon",
        features: [
          "Everything in Basic",
          "Priority support",
          "Advanced analytics",
          "Featured listings",
        ],
        cta: "Subscribe",
        ctaNote: "Cancel anytime. No hidden fees.",
      },
      enterprise: {
        title: "Enterprise",
        price: "Custom",
        period: "Contact us",
        features: [
          "Everything in Pro",
          "Custom integrations",
          "Dedicated support",
          "White-label options",
        ],
        cta: "Contact our support",
        ctaNote: "Custom pricing & SLAs available.",
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about our pricing and plans",
      questions: {
        isItReallyFree: {
          question: "Is it really free during the launch phase?",
          answer:
            "Yes! During our launch phase, all features are completely free for both freelancers and clients. This includes unlimited projects, proposals, and full platform access.",
        },
        whenWillPricingChange: {
          question: "When will the pricing change?",
          answer:
            "We'll provide plenty of notice before introducing any fees. The launch phase will continue until we've built a strong community and gathered sufficient feedback.",
        },
        whatHappensToExistingUsers: {
          question: "What happens to existing users when pricing changes?",
          answer:
            "Existing users will be grandfathered into favorable terms, and we'll always maintain a free tier for basic platform access.",
        },
        areThereHiddenFees: {
          question: "Are there any hidden fees?",
          answer:
            "No hidden fees! During the launch phase, everything is completely free. When we introduce pricing, it will be transparent and clearly communicated.",
        },
        canICancelAnytime: {
          question: "Can I cancel my plan anytime?",
          answer:
            "Yes, you can cancel or downgrade your plan at any time. There are no long-term contracts or cancellation fees.",
        },
      },
    },
  },
  // How it works page translations
  howItWorks: {
    hero: {
      title: "How It Works",
      subtitle:
        "A simple, secure platform for freelancers to earn money while gaining real-world experience in our community",
    },
    forFreelancers: {
      title: "For Freelancers",
      subtitle:
        "Find freelance work that aligns with your skills and career goals",
      steps: [
        {
          title: "Create Your Profile",
          description:
            "Sign up and create a detailed profile showcasing your skills, education, and experience. Add your portfolio and set your rates.",
        },
        {
          title: "Browse Projects",
          description:
            "Search through available projects from clients and businesses. Filter by skills, budget, and project type.",
        },
        {
          title: "Apply & Work",
          description:
            "Submit proposals, communicate with clients, complete projects, and earn money while building your portfolio.",
        },
      ],
    },
    forClients: {
      title: "For Clients",
      subtitle:
        "Find talented freelancers to help with your projects and business needs",
      steps: [
        {
          title: "Post Your Project",
          description:
            "Create detailed project descriptions with requirements, budget, and deadlines. Specify the skills you need.",
        },
        {
          title: "Review Proposals",
          description:
            "Review proposals from qualified freelancers. Check their profiles, portfolios, and previous work.",
        },
        {
          title: "Collaborate & Pay",
          description:
            "Hire the best freelancer, collaborate through our platform, and pay securely when the project is complete.",
        },
      ],
    },
    platformFeatures: {
      title: "Platform Features",
      subtitle: "Everything you need for successful collaboration",
      features: [
        {
          title: "Secure Payments",
          description:
            "Escrow protection ensures both parties are satisfied before payment is released.",
        },
        {
          title: "Built-in Messaging",
          description:
            "Communicate directly with project partners through our secure messaging system.",
        },
        {
          title: "Progress Tracking",
          description:
            "Monitor project progress, set milestones, and track deliverables in real-time.",
        },
        {
          title: "Rating System",
          description:
            "Build reputation through reviews and ratings from completed projects.",
        },
        {
          title: "Flexible Scheduling",
          description:
            "Work around your schedule with flexible deadlines and remote collaboration.",
        },
        {
          title: "Professional Focus",
          description:
            "Projects designed specifically for professional freelancers and business clients.",
        },
      ],
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Join thousands of freelancers and clients who are already using UniJobs to connect and collaborate.",
      joinAsFreelancer: "Join as Freelancer",
      joinAsClient: "Join as Client",
    },
  },
  // Freelancers page translations
  freelancersPage: {
    hero: {
      title: "For Freelancers",
      subtitle:
        "Find freelance opportunities and earn money while building your skills",
      startEarning: "Start Earning",
      browseProjects: "Browse Projects",
    },
    howItWorks: {
      title: "How It Works",
      subtitle:
        "Start earning money with your skills in just a few simple steps",
      steps: [
        {
          title: "1. Create Your Profile",
          description:
            "Sign up and build your professional profile. Showcase your skills, experience, and portfolio to attract clients.",
        },
        {
          title: "2. Find Projects",
          description:
            "Browse available projects that match your skills. Apply with competitive proposals and showcase your expertise.",
        },
        {
          title: "3. Earn Money",
          description:
            "Complete projects successfully and get paid securely. Build your reputation and earn more with each project.",
        },
      ],
    },
    benefits: {
      title: "Why Choose UniJobs?",
      subtitle:
        "Join thousands of freelancers who are already earning and growing their careers",
      features: [
        {
          title: "Flexible Earnings",
          description:
            "Set your own rates and work on projects that fit your schedule. Earn money while building your portfolio.",
        },
        {
          title: "Build Your Portfolio",
          description:
            "Complete real projects and build a professional portfolio that showcases your skills and experience.",
        },
        {
          title: "Learn & Grow",
          description:
            "Work on diverse projects to expand your skills and gain valuable real-world experience.",
        },
        {
          title: "Direct Communication",
          description:
            "Communicate directly with clients through our secure messaging system for clear project requirements.",
        },
        {
          title: "Secure Payments",
          description:
            "Get paid securely through our escrow system. Your earnings are protected and released upon project completion.",
        },
        {
          title: "Build Relationships",
          description:
            "Develop long-term relationships with clients and get repeat projects for steady income.",
        },
      ],
    },
    popularSkills: {
      title: "Popular Skills in Demand",
      subtitle:
        "These skills are highly sought after by clients on our platform",
      skills: [
        {
          title: "Programming",
          description: "Web, mobile, and software development",
        },
        {
          title: "Content Writing",
          description: "Articles, blogs, and copywriting",
        },
        {
          title: "Data Analysis",
          description: "Research, statistics, and insights",
        },
        {
          title: "Design & Graphics",
          description: "Logos, graphics, and visual content",
        },
      ],
    },
    portfolio: {
      title: "Featured Portfolio",
      subtitle:
        "Discover amazing work from our talented freelancers across various categories",
      viewMore: "View More Projects",
      noProjects: "No Completed Projects Yet",
      noProjectsDesc:
        "Be the first to complete a project and showcase your work here!",
      items: [
        {
          title: "E-commerce Website Development",
          description:
            "Modern responsive e-commerce platform with payment integration and admin dashboard",
          freelancer: "John Developer",
          budget: "₭2.5M",
        },
        {
          title: "Mobile App UI/UX Design",
          description:
            "Complete mobile app design with user research, wireframes, and high-fidelity prototypes",
          freelancer: "Sarah Designer",
          budget: "₭1.8M",
        },
        {
          title: "Cross-platform Mobile App",
          description:
            "React Native app for food delivery service with real-time tracking and payment",
          freelancer: "Alex Kumar",
          budget: "₭3.2M",
        },
        {
          title: "SEO Content Strategy",
          description:
            "Comprehensive content strategy with 50+ articles and keyword optimization",
          freelancer: "Lisa Writer",
          budget: "₭1.2M",
        },
        {
          title: "Business Intelligence Dashboard",
          description:
            "Data visualization dashboard with real-time analytics and reporting features",
          freelancer: "David Analyst",
          budget: "₭2.8M",
        },
        {
          title: "Multilingual Website Translation",
          description:
            "Complete website translation in 5 languages with cultural adaptation",
          freelancer: "Nina Translator",
          budget: "₭1.5M",
        },
        {
          title: "Market Research Report",
          description:
            "Comprehensive market analysis with competitor research and growth recommendations",
          freelancer: "Robert Johnson",
          budget: "₭2.1M",
        },
        {
          title: "Brand Identity Design",
          description:
            "Complete brand identity including logo, color palette, and brand guidelines",
          freelancer: "Grace Designer",
          budget: "₭1.6M",
        },
        {
          title: "Social Media Marketing Campaign",
          description:
            "Multi-platform social media campaign with 300% engagement increase",
          freelancer: "David Marketer",
          budget: "₭2.3M",
        },
      ],
    },
    successStories: {
      title: "Freelancer Success Stories",
      subtitle: "Hear from freelancers who have found success on our platform",
      stories: [
        {
          name: "Sarah Chen",
          role: "Web Developer",
          quote:
            "I've earned over ₭5M through UniJobs while building my portfolio. The platform helped me land my first full-time job!",
          earnings: "₭5M+ earned",
        },
        {
          name: "Mike Rodriguez",
          role: "Content Writer",
          quote:
            "Started as a part-time freelancer, now I'm earning a steady income while studying. Great way to gain experience!",
          earnings: "₭2M+ earned",
        },
        {
          name: "Alex Johnson",
          role: "Data Analyst",
          quote:
            "The projects helped me develop real-world skills that I couldn't learn in class. Highly recommend!",
          earnings: "₭3M+ earned",
        },
      ],
    },
    cta: {
      title: "Ready to Start Earning?",
      subtitle:
        "Join thousands of freelancers who are already earning money and building their careers on our platform.",
      createProfile: "Create Your Profile",
      browseProjects: "Browse Projects",
    },
  },
  // Dashboard page translations
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back! Here's what's happening with your projects.",
    loading: "Loading your dashboard...",
    stats: {
      activeProjects: "Active Projects",
      totalEarned: "Total Earned",
      totalSpent: "Total Spent",
      completed: "Completed",
      rating: "Rating",
      currentlyWorking: "Currently working",
      fromCompletedProjects: "From completed projects",
      onCompletedProjects: "On completed projects",
      projectsFinished: "Projects finished",
      noRatingsYet: "No ratings yet",
      clientRating: "Client Rating",
      freelancerRating: "Freelancer Rating",
      overallRating: "Overall Rating",
      asClient: "As a client",
      fromClients: "From clients",
      combinedRating: "Combined rating",
    },
    header: {
      welcomeBack: "Welcome back, {name}!",
      member: "Member",
      freelancer: "Freelancer",
      client: "Client",
      browseProjects: "Browse Projects",
      postProject: "Post Project",
    },
    quickActions: {
      title: "Quick Actions",
      findProjects: {
        title: "Find Projects",
        description: "Browse available opportunities",
      },
      updateProfile: {
        title: "Update Profile",
        description: "Edit skills and portfolio",
      },
      myProposals: {
        title: "My Proposals",
        description: "View submitted proposals",
      },
      messages: {
        title: "Messages",
        description: "Chat with clients",
      },
      postProject: {
        title: "Post Project",
        description: "Create new project",
      },
      manageProjects: {
        title: "Manage Projects",
        description: "View your projects",
      },
      reviewProposals: {
        title: "Review Proposals",
        description: "Check freelancer proposals",
      },
      messagesClient: {
        title: "Messages",
        description: "Chat with freelancers",
      },
    },
    // Messages page translations
    messagesPage: {
      title: "Messages",
      searchPlaceholder: "Search conversations...",
      noConversations: "No conversations yet.",
      noConversationsFound: "No conversations found.",
      loadingConversations: "Loading conversations...",
      selectConversation: "Select a conversation",
      selectConversationDesc:
        "Choose a conversation from the list to start chatting",
      noMessages: "No messages yet. Start the conversation!",
      typeMessage: "Type your message...",
      send: "Send",
      backToMessages: "Back to messages",
      today: "Today",
      yesterday: "Yesterday",
      directMessage: "Direct Message",
      project: "Project",
      unknownUser: "Unknown User",
      user: "User",
    },
    recentActivity: {
      title: "Recent Activity",
      noActivity: "No recent activity",
      noActivityDescription: "Start by creating or applying to projects",
      projectCreated: 'Created project "{title}"',
      projectCompleted: 'Completed project "{title}"',
      projectAssigned: 'Assigned to project "{title}"',
      proposalSubmitted: 'Applied to "{title}"',
      proposalSubmittedDescription: "Submitted proposal for {title}",
    },
    profileSummary: {
      title: "Profile Summary",
      memberSince: "Member since",
      skills: "Skills",
      hourlyRate: "Hourly rate",
      location: "Location",
      notSet: "Not set",
    },
    thisMonth: {
      title: "This Month",
      projectsCompleted: "Projects completed",
      earnings: "Earnings",
      spent: "Spent",
      proposalsSent: "Proposals sent",
      activeProjects: "Active projects",
    },
    tipsAndResources: {
      title: "Tips & Resources",
      completeProfile: "Complete your profile to get more projects",
      respondQuickly: "Respond quickly to project invitations",
      buildPortfolio: "Build your portfolio with completed projects",
    },
  },
  // Project detail page translations
  projectDetail: {
    loading: "Loading project...",
    error: "Error",
    projectNotFound: "Project Not Found",
    projectNotFoundDesc: "The project you're looking for doesn't exist.",
    backToProjects: "Back to Projects",
    projects: "Projects",
    views: "views",
    proposal: "proposal",
    proposals: "proposals",
    description: "Description",
    skillsRequired: "Skills Required",
    attachments: "Attachments",
    attachment: "Attachment",
    projectParticipants: "Project Participants",
    projectCreator: "Project Creator",
    assignedFreelancer: "Assigned Freelancer",
    noFreelancerAssigned: "No freelancer assigned",
    openForProposals: "Open for proposals",
    projectDetails: "Project Details",
    budget: "Budget",
    category: "Category",
    timeline: "Timeline",
    deadline: "Deadline",
    posted: "Posted",
    lastUpdated: "Last Updated",
    perHour: "per hour",
    fixedPrice: "fixed price",
    actions: "Actions",
    submitProposal: "Submit Proposal",
    editProject: "Edit Project",
    completionStatus: "Completion Status",
    projectCompleted: "Project Completed",
    projectCompletedDesc:
      "Both client and freelancer have marked the project as completed",
    clientCompleted: "Client Completed",
    clientCompletedDesc: "Client has marked the project as completed",
    freelancerCompleted: "Freelancer Completed",
    freelancerCompletedDesc: "Freelancer has marked the project as completed",
    unknownDate: "Unknown date",
    client: "Client",
    ownProjectMessage: "You cannot apply to your own project",
    noCompletionYet: "No completion status yet",
    noCompletionYetDesc:
      "The project is still in progress. No completion status has been set.",
    waitingClientCompletion: "Waiting for client to mark as completed",
    waitingFreelancerCompletion: "Waiting for freelancer to mark as completed",
    markAsCompleted: "Mark as Completed",
    confirmCompletion: "Confirm Completion",
    confirmFreelancerTitle: "Confirm Project Completion",
    confirmFreelancerDesc:
      "Are you sure you want to mark this project as completed? This action cannot be undone.",
    confirmClientTitle: "Confirm Project Completion",
    confirmClientDesc:
      "Are you sure you want to mark this project as completed? This action cannot be undone.",
    projectInReview: "Project In Review",
    projectInReviewDesc:
      "The project is currently under review by the client. Please wait for their confirmation.",
    projectSamples: "Samples",
  },
  // Manage projects page translations
  manageProjects: {
    loading: "Loading...",
    manageProjects: "Manage Projects",
    manageProjectsDesc: "View and manage your posted projects",
    postNewProject: "Post New Project",
    searchProjects: "Search Projects",
    searchPlaceholder: "Search by title or description...",
    status: "Status",
    category: "Category",
    allCategories: "All Categories",
    allStatus: "All Status",
    open: "Open",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    yourProjects: "Your Projects",
    noProjectsFound: "No projects found",
    noProjectsYet: "You haven't posted any projects yet.",
    noProjectsMatch: "No projects match your current filters.",
    postFirstProject: "Post Your First Project",
    views: "views",
    proposals: "proposals",
    budget: "Budget",
    more: "more",
    viewDetails: "View Details",
    editProject: "Edit Project",
    viewProposals: "View Proposals",
    cancelProject: "Cancel Project",
    webDevelopment: "Web Development",
    contentWriting: "Content Writing",
    dataAnalysis: "Data Analysis",
    design: "Design",
    research: "Research",
    translation: "Translation",
    confirmCancelTitle: "Confirm Project Cancellation",
    confirmCancelDesc:
      "Are you sure you want to cancel this project? This action cannot be undone.",
    confirmDelete: "Confirm",
    projectDeletedNoRefund:
      "Project cancelled. No refunds will be issued for any payments made.",
    projectDeletedWithRefund:
      "Project cancelled. A refund has been issued for any payments made.",
  },
  // Create project page translations
  createProject: {
    pleaseLogin: "Please log in to create a project",
    login: "Login",
    projects: "Projects",
    createProject: "Create Project",
    creating: "Creating...",
    uploading: "Uploading",
    createNewProject: "Create a New Project",
    step: "Step",
    of: "of",
    projectTypeVisibility: "Project Type & Visibility",
    projectTypeDesc:
      "Choose who can see and apply to your project, and how many freelancers can access it.",
    whoAreYouPosting: "Who are you posting this project as? *",
    client: "Client",
    clientDesc: "I need freelancers to work on my project",
    freelancer: "Freelancer",
    freelancerDesc: "I need help completing my project",
    maxFreelancers: "Maximum number of freelancers that can apply *",
    freelancers: "freelancers",
    maxFreelancersDesc:
      "Set how many freelancers can submit proposals to your project",
    projectVisibility: "Project Visibility *",
    public: "Public",
    publicDesc: "Anyone can see and apply to your project",
    private: "Private",
    privateDesc: "Only invited freelancers can see and apply",
    basicInformation: "Basic Information",
    basicInfoDesc: "Start by providing the basic details about your project.",
    projectTitle: "Project Title *",
    titlePlaceholder: "Enter a clear, descriptive title for your project",
    projectDescription: "Project Description *",
    descriptionPlaceholder:
      "Describe your project in detail. Include requirements, goals, and any specific instructions...",
    projectDetails: "Project Details",
    detailsDesc: "Specify the category, timeline, and budget for your project.",
    category: "Category *",
    selectCategory: "Select a category",
    timeline: "Timeline *",
    selectTimeline: "Select timeline",
    budget: "Budget *",
    budgetPlaceholder: "Enter your budget",
    budgetType: "Budget Type *",
    fixedPrice: "Fixed Price",
    requirements: "Requirements",
    requirementsDesc:
      "Add the skills needed and optional deadline for your project.",
    skillsRequired: "Skills Required",
    skillPlaceholder: "Add a skill (e.g., React, Python, Design)",
    add: "Add",
    deadline: "Deadline (Optional)",
    projectMedia: "Banner and Samples",
    mediaDesc:
      "Add an image to make your project more attractive to freelancers.",
    projectImage: "Project Image (Optional)",
    noImageSelected: "No image selected",
    chooseImage: "Choose Image",
    selected: "Selected",
    reviewSubmit: "Review & Submit",
    reviewDesc: "Review your project details before submitting.",
    description: "Description",
    noneSpecified: "None specified",
    previous: "Previous",
    next: "Next",
    creatingProject: "Creating Project...",
    // Categories
    webDevelopment: "Web Development",
    mobileDevelopment: "Mobile Development",
    writing: "Writing",
    marketing: "Marketing",
    translation: "Translation",
    research: "Research",
    design: "Design",
    dataAnalysis: "Data Analysis",
    other: "Other",
    fixedPriceOnly: "Fixed Price Only",
    // Timelines
    lessThan1Week: "Less than 1 week",
    oneToTwoWeeks: "1-2 weeks",
    twoToFourWeeks: "2-4 weeks",
    oneToTwoMonths: "1-2 months",
    twoToThreeMonths: "2-3 months",
    moreThan3Months: "More than 3 months",
    emailVerificationRequired: "Email Verification Required",
    emailVerificationMessage:
      "You must verify your email address before you can create a project.",
    permissionDenied: "Permission Denied",
    permissionDeniedMessage:
      "Your account must be a client or both freelancer and client to create a project. Please update your account type in your profile.",
    redirecting: "You will be redirected to the home page shortly.",
    yourCredits: "Your Credits",
    requiredCredits: "Credits Required",
    projectBudget: "Project Budget",
    remaining: "Remaining",
    insufficientCredits: "Insufficient Credits",
    insufficientCreditsMessage:
      "You do not have enough credits to create this project.",
    buyCredits: "Top Up",
    cancel: "Cancel",
    replaceImage: "Replace Image",
    removeImage: "Remove Image",
    editQuota: "Edit Quota *",
    editQuotaDesc:
      "Number of times the client can request revisions (Maximum 3).",
    bannerImage: "Main Banner Image",
    sampleImages: "Sample Reference Images",
    sampleImagesDesc:
      "Add supporting images to help freelancers understand your goal.",
    addSampleImage: "Add Sample Image",
    clearDraft: "Clear Draft",
    contactSupport: "Contact Support",
  },
  // Profile page translations
  profile: {
    title: "Profile",
    subtitle: "Manage your profile and settings",
    loading: "Loading your profile...",
    back: "Back",
    overview: "Overview",
    portfolio: "Portfolio",
    skills: "Skills",
    personalInfo: {
      title: "Personal Information",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      location: "Location",
      bio: "Bio",
      skills: "Skills",
      hourlyRate: "Hourly Rate",
      memberSince: "Member Since",
      notSet: "Not set",
      saveChanges: "Save Changes",
      changesSaved: "Changes saved successfully!",
      edit: "Edit",
    },
    stats: {
      active: "Active",
      completed: "Completed",
      earned: "Earned",
      rating: "Rating",
    },
    recentActivity: {
      title: "Recent Activity",
      noProjects: "No recent projects",
    },
    portfolioSection: {
      title: "Portfolio",
      addProject: "Add Project",
      editProject: "Edit Project",
      deleteProject: "Delete Project",
      projectTitle: "Project Title",
      description: "Description",
      technologies: "Technologies",
      link: "Link (Optional)",
      noProjects: "No portfolio projects yet",
      noProjectsDesc: "Complete projects to build your portfolio",
      completed: "Completed",
    },
    skillsSection: {
      title: "Skills",
      addSkill: "Add Skill",
      noSkills: "No skills added yet",
      noSkillsDesc: "Add your skills to get more projects",
      enterSkillName: "Enter skill name",
      addSkillButton: "Add Skill",
    },
    editModal: {
      title: "Edit",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      enterField: "Enter",
    },
    profileImage: {
      changePhoto: "Change Photo",
      updateProfileImage: "Update Profile Image",
      uploading: "Uploading...",
      updateSuccess: "Profile image updated successfully!",
      uploadFailed: "Failed to upload image",
    },
    userTypes: {
      freelancer: "Freelancer",
      client: "Client",
      member: "Member",
    },
  },
  // Projects page translations
  projects: {
    title: "Projects",
    subtitle: "Browse and manage projects",
    loading: "Loading projects...",
    hero: {
      title: "Find Your Next Project",
      subtitle:
        "Browse through our community's projects and find opportunities that match your skills",
    },
    search: {
      title: "Search Projects",
      subtitle:
        "Use filters to find projects that match your skills and interests",
      placeholder: "Search for projects, skills, or keywords...",
      clearFilters: "Clear Filters",
    },
    filters: {
      title: "Filters",
      category: "Category",
      budget: "Budget",
      status: "Status",
      budgetType: "Budget Type",
      clearAll: "Clear All",
      allCategories: "All Categories",
      allStatus: "All Status",
      allTypes: "All Types",
    },
    categories: {
      webDevelopment: "Web Development",
      mobileDevelopment: "Mobile Development",
      design: "Design",
      writing: "Writing",
      research: "Research",
      dataAnalysis: "Data Analysis",
      marketing: "Marketing",
      translation: "Translation",
      other: "Other",
    },
    statuses: {
      open: "Open",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    budgetTypes: {
      fixedPrice: "Fixed Price",
      hourlyRate: "Hourly Rate",
    },
    results: {
      title: "Projects Found",
      noResults: "No projects found",
      noResultsDescription: "Try adjusting your search criteria or filters",
    },
    projectCard: {
      budget: "Budget",
      proposals: "Proposals",
      postedBy: "Posted by",
      postedOn: "Posted on",
      posted: "Posted",
      viewDetails: "View Details",
      applyNow: "Apply Now",
      submitProposal: "Submit Proposal",
      views: "views",
      category: "Category:",
      timeline: "Timeline:",
      proposal: "proposal",
      proposalsPlural: "proposals",
      loading: "Loading...",
      moreSkills: "more",
    },
    createProject: "Create Project",
    postProject: "Post a Project",
    noProjects: "No projects found.",
  },
  // Proposals page translations
  proposals: {
    title: "Proposals",
    subtitle: "Manage your submitted and received proposals",
    loading: "Loading proposals...",
    browseProjects: "Browse Projects",
    tabs: {
      submitted: "Submitted Proposals",
      received: "Received Proposals",
    },
    filters: {
      title: "Filter by status:",
      allStatus: "All Status",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    },
    status: {
      pending: "Pending Review",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    },
    emptyState: {
      title: "No proposals",
      submitted: {
        title: "No submitted proposals",
        description: "You haven't submitted any proposals yet.",
        action: "Browse Projects",
      },
      received: {
        title: "No received proposals",
        description: "You haven't received any proposals yet.",
      },
    },
    proposalCard: {
      client: "Client:",
      freelancer: "Freelancer:",
      budget: "Budget:",
      proposedBudget: "Proposed Budget",
      duration: "Duration:",
      submitted: "Submitted",
      coverLetter: "Cover Letter",
      workSamples: "Work Samples",
      viewDetails: "View Details",
      accept: "Accept",
      reject: "Reject",
      startChat: "Start Chat",
      openingChat: "Opening Chat...",
      moreSamples: "more",
    },
    detail: {
      title: "Proposal Details",
      subtitle: "View comprehensive proposal information",
      proposedBudget: "Proposed Budget",
      coverLetter: "Cover Letter",
      workPlan: "Work Plan",
      workSamples: "Work Samples",
      milestones: "Milestones",
      availability: "Availability",
      communication: "Communication Preferences",
      details: "Proposal Details",
      budget: "Budget",
      duration: "Duration",
      submitted: "Submitted",
      actions: "Actions",
      accept: "Accept Proposal",
      reject: "Reject Proposal",
      startChat: "Start Chat",
      backToList: "Back to List",
      freelancer: "Freelancer",
      client: "Client",
      notFound: "Proposal Not Found",
      notFoundMessage:
        "The proposal you are looking for does not exist or has been removed.",
      backToProposals: "Back to Proposals",
      due: "Due Date",
    },
    confirmAcceptTitle: "Confirm Proposal",
    confirmAcceptDesc: "Are you sure to confirm accept this proposal?",
  },
  // Settings page translations
  settings: {
    title: "Settings",
    subtitle: "Manage your account settings",
    loading: "Loading settings...",
    back: "Back",
    notifications: "Notifications",
    privacy: "Privacy & Security",
    account: "Account",
    notificationDesc: "Manage how you receive alerts, messages, and updates.",
    privacyDesc: "Control who can see your information and activity.",
    accountDesc: "Update your profile details or change your password.",
    notificationPreferences: {
      title: "Notification Preferences",
      emailNotifications: {
        title: "Email Notifications",
        description: "Receive notifications via email",
      },
      projectUpdates: {
        title: "Project Updates",
        description: "Get notified about project status changes",
      },
      proposalNotifications: {
        title: "Proposal Notifications",
        description: "Receive notifications for new proposals",
      },
      browserNotifications: {
        title: "Browser Notifications",
        description: "Receive push notifications in your browser",
      },
      marketingEmails: {
        title: "Marketing Emails",
        description: "Receive promotional emails and updates",
      },
      weeklyDigest: {
        title: "Weekly Digest",
        description: "Receive a weekly summary of your activity",
      },
    },
    privacySecurity: {
      title: "Privacy & Security",
      profileVisibility: {
        title: "Profile Visibility",
        description: "Control who can see your profile",
      },
      searchableProfile: {
        title: "Searchable Profile",
        description: "Allow others to find your profile in search",
      },
      showEmail: {
        title: "Show Email",
        description: "Display your email on your profile",
      },
      showPhone: {
        title: "Show Phone",
        description: "Display your phone number on your profile",
      },
      allowMessages: {
        title: "Allow Messages",
        description: "Allow others to send you messages",
      },
    },
    accountSettings: {
      title: "Account Settings",
      accountStatus: {
        title: "Account Status",
        active: "Active",
        inactive: "Inactive",
      },
      accountSecurity: {
        title: "Account Security",
        changePassword: "Change Password",
        changeEmail: "Change Email",
      },
      accountStatistics: {
        title: "Account Statistics",
        projectsPosted: "Projects Posted:",
        totalSpent: "Total Spent:",
        freelancersHired: "Freelancers Hired:",
        completedProjects: "Completed Projects:",
        openProjects: "Open Projects:",
        projectsCompleted: "Projects Completed:",
        totalEarned: "Total Earned:",
        activeProjects: "Active Projects:",
        favoriteCount: "Favorites:",
      },
      ratingBreakdown: {
        title: "Rating Breakdown",
        freelancerTitle: "Freelancer Rating Breakdown",
        clientTitle: "Client Rating Breakdown",
        communication: "Communication:",
        quality: "Quality:",
        value: "Value:",
        timeliness: "Timeliness:",
      },
      dangerZone: {
        title: "Danger Zone",
        description: "These actions cannot be undone.",
        deleteAccount: "Delete Account",
      },
    },
    editModal: {
      title: "Edit",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      enterField: "Enter",
      enterBio: "Enter your bio",
    },
  },
  // Terms page translations
  termsPage: {
    title: "Terms of Service",
    subtitle: "Please read these terms carefully",
    lastUpdated: "Last updated: January 2025",
    sections: {
      acceptance: {
        title: "1. Acceptance of Terms",
        content:
          'By accessing and using UniJobs ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
      },
      description: {
        title: "2. Description of Service",
        content:
          "UniJobs is a platform that connects students and freelancers with clients seeking professional services. The Platform facilitates project posting, proposal submission, and project management between clients and freelancers.",
      },
      userAccounts: {
        title: "3. User Accounts",
        content: "Account registration and management requirements.",
        items: [
          "You must register for an account to use certain features of the Platform.",
          "You are responsible for maintaining the confidentiality of your account credentials.",
          "You must provide accurate, current, and complete information during registration.",
          "You are responsible for all activities that occur under your account.",
        ],
      },
      userResponsibilities: {
        title: "4. User Responsibilities",
        content:
          "Responsibilities for different types of users on the platform.",
        items: [
          {
            role: "Clients:",
            description:
              "Must provide clear project requirements, respond to proposals in a timely manner, and pay for completed work as agreed.",
          },
          {
            role: "Freelancers:",
            description:
              "Must deliver work according to project specifications, meet deadlines, and maintain professional communication.",
          },
          {
            role: "All Users:",
            description:
              "Must not engage in fraudulent activities, spam, or harassment of other users.",
          },
        ],
      },
      paymentAndFees: {
        title: "5. Payment and Fees",
        content: "Payment terms and fee structure for platform usage.",
        items: [
          "The Platform may charge service fees for transactions.",
          "All payments must be made through the Platform's designated payment system.",
          "Refunds are subject to the Platform's refund policy and project completion status.",
        ],
      },
      intellectualProperty: {
        title: "6. Intellectual Property",
        content: "Rights and ownership of work created through the platform.",
        items: [
          "Freelancers retain ownership of their work unless otherwise agreed in writing.",
          "Clients receive rights to completed work as specified in project agreements.",
          "The Platform retains rights to its own content and services.",
        ],
      },
      disputeResolution: {
        title: "7. Dispute Resolution",
        content: "How disputes between users are handled.",
        items: [
          "Users are encouraged to resolve disputes directly with each other.",
          "The Platform may mediate disputes but is not responsible for project outcomes.",
          "Legal disputes should be resolved through appropriate legal channels.",
        ],
      },
      limitationOfLiability: {
        title: "8. Limitation of Liability",
        content:
          "The Platform is not liable for any damages arising from the use of our services, including but not limited to project outcomes, communication issues, or payment disputes between users.",
      },
      termination: {
        title: "9. Termination",
        content: "Account termination policies and procedures.",
        items: [
          "Users may terminate their accounts at any time.",
          "The Platform may suspend or terminate accounts for violations of these terms.",
          "Termination does not affect obligations already incurred.",
        ],
      },
      changesToTerms: {
        title: "10. Changes to Terms",
        content:
          "We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the Platform constitutes acceptance of updated terms.",
      },
      contactInformation: {
        title: "11. Contact Information",
        content:
          "For questions about these Terms of Service, please contact us at",
        email: "support@UniJobs.com",
      },
    },
  },

  // Cookie policy page translations
  cookiePolicy: {
    title: "Cookie Policy",
    subtitle: "How we use cookies and similar technologies",
    lastUpdated: "Last updated: January 2025",
    sections: {
      whatAreCookies: {
        title: "What Are Cookies?",
        content:
          "Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.",
      },
      howWeUseCookies: {
        title: "How We Use Cookies",
        content:
          "We use cookies to enhance your experience and improve our platform.",
        items: [
          {
            type: "Essential Cookies:",
            description:
              "These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.",
          },
          {
            type: "Performance Cookies:",
            description:
              "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
          },
          {
            type: "Functionality Cookies:",
            description:
              "These cookies allow the website to remember choices you make and provide enhanced, more personal features.",
          },
          {
            type: "Targeting Cookies:",
            description:
              "These cookies may be set through our site by our advertising partners to build a profile of your interests.",
          },
        ],
      },
      typesOfCookies: {
        title: "Types of Cookies We Use",
        content: "We use different types of cookies for various purposes.",
        items: [
          {
            title: "1. Session Cookies",
            description:
              "These cookies are temporary and are deleted when you close your browser. They help us maintain your session and remember your login status while you browse our platform.",
          },
          {
            title: "2. Persistent Cookies",
            description:
              "These cookies remain on your device for a set period or until you delete them. They help us remember your preferences and settings for future visits.",
          },
          {
            title: "3. Third-Party Cookies",
            description:
              "These cookies are set by third-party services we use, such as Google Analytics, payment processors, and social media platforms.",
          },
        ],
      },
      specificCookies: {
        title: "Specific Cookies We Use",
        content: "Here are the specific cookies we use on our platform.",
        items: [
          {
            title: "Authentication Cookies",
            description:
              "Help us keep you logged in and secure your account information.",
          },
          {
            title: "Preference Cookies",
            description:
              "Remember your language preferences, theme settings, and other customization options.",
          },
          {
            title: "Analytics Cookies",
            description:
              "Help us understand how users interact with our platform to improve our services.",
          },
          {
            title: "Security Cookies",
            description:
              "Help protect against fraud and ensure secure transactions on our platform.",
          },
        ],
      },
      managingCookies: {
        title: "Managing Your Cookie Preferences",
        content: "You can control and manage cookies in several ways:",
        items: [
          {
            method: "Browser Settings:",
            description:
              "Most browsers allow you to refuse cookies or delete them. Check your browser's help menu for instructions.",
          },
          {
            method: "Cookie Consent:",
            description:
              "When you first visit our site, you can choose which types of cookies to accept.",
          },
          {
            method: "Third-Party Opt-Out:",
            description:
              "You can opt out of third-party cookies through their respective privacy policies.",
          },
        ],
      },
      impactOfDisabling: {
        title: "Impact of Disabling Cookies",
        content:
          "Please note that disabling certain cookies may affect the functionality of our website. Essential cookies cannot be disabled as they are necessary for the platform to work properly.",
      },
      updatesToPolicy: {
        title: "Updates to This Policy",
        content:
          "We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.",
      },
      contactUs: {
        title: "Contact Us",
        content:
          "If you have any questions about our use of cookies, please contact us at",
        email: "privacy@UniJobs.com",
      },
    },
  },
  // Privacy page translations
  privacyPage: {
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your personal information",
    lastUpdated: "Last updated: January 2025",
    sections: {
      introduction: {
        title: "Introduction",
        content:
          'UniJobs ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
        agreement:
          "By using UniJobs, you agree to the collection and use of information in accordance with this policy.",
      },
      informationWeCollect: {
        title: "Information We Collect",
        personalInfo: {
          title: "Personal Information",
          description:
            "We collect information you provide directly to us, including:",
          items: [
            "Name, email address, and contact information",
            "Profile information (skills, experience, education)",
            "Payment and billing information",
            "Project details and communications",
            "Profile pictures and portfolio materials",
          ],
        },
        automaticInfo: {
          title: "Automatically Collected Information",
          description:
            "We automatically collect certain information when you use our platform:",
          items: [
            "Device information (IP address, browser type, operating system)",
            "Usage data (pages visited, time spent, features used)",
            "Cookies and similar tracking technologies",
            "Log files and analytics data",
          ],
        },
      },
      howWeUseInformation: {
        title: "How We Use Your Information",
        description: "We use the collected information for various purposes:",
        items: [
          "Provide a platform for students to earn money while gaining real-world experience",
          "Connect students with opportunities in our academic freelancing community",
          "Facilitate projects and collaborations within our network",
          "Process payments and manage billing",
          "Send important updates and notifications",
          "Improve our platform and user experience",
          "Ensure platform security and prevent fraud",
          "Comply with legal obligations",
        ],
      },
      informationSharing: {
        title: "Information Sharing and Disclosure",
        description:
          "We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:",
        items: [
          {
            label: "With other users:",
            text: "Your profile information is visible to other users as necessary for the platform to function",
          },
          {
            label: "Service providers:",
            text: "We may share information with trusted third-party service providers who assist us in operating our platform",
          },
          {
            label: "Legal requirements:",
            text: "We may disclose information if required by law or to protect our rights and safety",
          },
          {
            label: "Business transfers:",
            text: "In the event of a merger or acquisition, your information may be transferred",
          },
        ],
      },
      dataSecurity: {
        title: "Data Security",
        description:
          "We implement appropriate security measures to protect your personal information:",
        items: [
          "Encryption of sensitive data in transit and at rest",
          "Regular security assessments and updates",
          "Access controls and authentication measures",
          "Secure payment processing",
          "Regular backups and disaster recovery procedures",
        ],
        note: "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      },
      yourRights: {
        title: "Your Rights and Choices",
        description:
          "You have certain rights regarding your personal information:",
        items: [
          {
            label: "Access:",
            text: "You can request access to your personal information",
          },
          {
            label: "Correction:",
            text: "You can update or correct your information through your account settings",
          },
          {
            label: "Deletion:",
            text: "You can request deletion of your account and associated data",
          },
          {
            label: "Opt-out:",
            text: "You can opt out of marketing communications",
          },
          {
            label: "Data portability:",
            text: "You can request a copy of your data in a portable format",
          },
        ],
      },
      cookies: {
        title: "Cookies and Tracking Technologies",
        description:
          "We use cookies and similar technologies to enhance your experience:",
        items: [
          {
            label: "Essential cookies:",
            text: "Required for basic platform functionality",
          },
          {
            label: "Analytics cookies:",
            text: "Help us understand how users interact with our platform",
          },
          {
            label: "Preference cookies:",
            text: "Remember your settings and preferences",
          },
          {
            label: "Marketing cookies:",
            text: "Used for targeted advertising (with your consent)",
          },
        ],
        note: "You can control cookie settings through your browser preferences.",
      },
      thirdPartyServices: {
        title: "Third-Party Services",
        description:
          "Our platform may contain links to third-party services or integrate with external services:",
        items: [
          "Payment processors (Stripe, PayPal)",
          "Analytics services (Google Analytics)",
          "Cloud storage services (Google Drive)",
          "Communication tools and integrations",
        ],
        note: "These third-party services have their own privacy policies, and we are not responsible for their practices.",
      },
      childrenPrivacy: {
        title: "Children's Privacy",
        content:
          "Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.",
      },
      internationalUsers: {
        title: "International Users",
        content:
          "If you are accessing our platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our platform, you consent to the transfer of your information to the United States.",
      },
      changesToPolicy: {
        title: "Changes to This Privacy Policy",
        content:
          'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.',
      },
      contactUs: {
        title: "Contact Us",
        description:
          "If you have any questions about this Privacy Policy or our data practices, please contact us:",
        email: "Email:",
        emailAddress: "privacy@UniJobs.com",
        address: "Address:",
        addressValue:
          "123 Education Street, University District, City, State 12345",
        phone: "Phone:",
        phoneNumber: "+1 (555) 123-4567",
      },
    },
  },
  // User Home Page translations
  userHomePage: {
    title: "User Home",
    subtitle: "Welcome to your personalized dashboard",
    loading: "Loading...",
    stats: {
      active: "Active",
      completed: "Completed",
      earned: "Earned",
      spent: "Spent",
    },
    header: {
      welcomeBack: "Welcome back, {name}!",
      member: "Member",
      freelancer: "Freelancer",
      client: "Client",
      viewDashboard: "View Dashboard →",
    },
    search: {
      title: "Find Your Next Project",
      subtitle: "Discover opportunities that match your skills and interests",
      placeholder: "Search for projects, skills, or keywords...",
      searchButton: "Search Projects",
      filters: "Filters",
    },
    filters: {
      category: "Category",
      budgetRange: "Budget Range",
      status: "Status",
      clearFilters: "Clear Filters",
      allCategories: "All Categories",
      allBudgets: "All Budgets",
      allStatus: "All Status",
      categories: {
        webDevelopment: "Web Development",
        contentWriting: "Content Writing",
        dataAnalysis: "Data Analysis",
        design: "Design",
        research: "Research",
        translation: "Translation",
      },
      budgetRanges: {
        "0-50000": "₭0 - ₭50K",
        "50000-200000": "₭50K - ₭200K",
        "200000-500000": "₭200K - ₭500K",
        "500000+": "₭500K+",
      },
      statusOptions: {
        open: "Open",
        inProgress: "In Progress",
        completed: "Completed",
      },
    },
    quickActions: {
      title: "Quick Actions",
      dashboard: {
        title: "Dashboard",
        description: "View your overview",
      },
      findProjects: {
        title: "Find Projects",
        description: "Browse available projects",
      },
      postProject: {
        title: "Post Project",
        description: "Create a new project",
      },
      myProposals: {
        title: "My Proposals",
        description: "View your applications",
      },
      manageProjects: {
        title: "Manage Projects",
        description: "View your projects",
      },
      reviewProposals: {
        title: "Review Proposals",
        description: "Check freelancer proposals",
      },
    },
    recentProjects: {
      title: "Recent Projects",
      viewAll: "View All",
      noProjects: "No projects available",
      noProjectsDescription: "Check back later for new opportunities",
      projectCard: {
        views: "views",
        budget: "Budget",
        viewDetails: "View Details",
        applyNow: "Apply Now",
        moreSkills: "+{count} more",
        perHour: "/hr",
      },
    },
    profileSummary: {
      title: "Profile Summary",
      rating: "Rating",
      clientRating: "Client Rating",
      freelancerRating: "Freelancer Rating",
      projectsCompleted: "Projects Completed",
      totalEarned: "Total Earned",
      totalSpent: "Total Spent",
      activeProjects: "Active Projects",
      noRatingsYet: "No ratings yet",
      editProfile: "Edit Profile",
    },
    recentActivity: {
      title: "Recent Activity",
      noActivity: "No recent activity",
      noActivityDescription: "Start by creating or applying to projects",
      projectCreated: 'Created "{title}"',
      projectAssigned: 'Assigned to "{title}"',
      projectCompleted: 'Completed "{title}"',
      proposalSubmitted: 'Applied to "{title}"',
    },
    quickTips: {
      title: "💡 Quick Tips",
      clientTips: {
        tip1: "Be clear about your project requirements",
        tip2: "Review proposals thoroughly before hiring",
        tip3: "Provide timely feedback to freelancers",
        tip4: "Set realistic project deadlines",
      },
      freelancerTips: {
        tip1: "Keep your profile updated with recent skills",
        tip2: "Respond to messages within 24 hours",
        tip3: "Ask questions before starting work",
        tip4: "Deliver quality work on time",
      },
      generalTips: {
        tip1: "Keep your profile updated with recent skills",
        tip2: "Respond to messages within 24 hours",
        tip3: "Set realistic project deadlines",
        tip4: "Ask questions before starting work",
      },
    },
  },
  // Landing Page translations
  landingPage: {
    hero: {
      title:
        "UniJobs - The platform where everyone can earn anytime, anywhere.",
      subtitle:
        "Join the freelance student community. Create your portfolio and develop your skills. (Especially designed for students.)",
      startEarning: "Start Earning Today",
      learnHow: "Learn How It Works",
      searchPlaceholder: "Search for jobs, projects, or skills...",
      searchButton: "Search",
    },
    categories: {
      title: "Popular Categories",
      programming: "Programming",
      design: "Design",
      business: "Business",
      media: "Media",
      translation: "Translation",
      "voice & audio": "Voice & Audio",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Simple steps to start earning and learning in our community",
      step1: {
        title: "Create Your Profile",
        description:
          "Students and teachers sign up and create detailed profiles showcasing their skills, experience, and requirements.",
      },
      step2: {
        title: "Post or Find Projects",
        description:
          "Teachers post projects and assignments. Students browse and apply to projects that match their skills.",
      },
      step3: {
        title: "Collaborate & Earn",
        description:
          "Work together, complete projects, and students earn money while gaining valuable experience.",
      },
    },
    features: {
      title: "Why Choose UniJobs?",
      subtitle:
        "Join a community of thousands waiting to hire and collaborate through freelance opportunities.",
      earnWhileLearn: {
        title: "Earn Income Anytime, Anywhere",
        description:
          "Discover opportunities that match your projects and build income while improving your skills.",
      },
      buildPortfolio: {
        title: "Build Your Portfolio",
        description:
          "Gain real-world experience and build a professional portfolio that stands out to employers",
      },
      joinCommunity: {
        title: "Join Our Community",
        description:
          "Connect with thousands of students and opportunities in the largest academic freelancing network",
      },
    },
    userTypes: {
      title: "For Freelancers & Clients",
      subtitle:
        "Whether you're a freelancer looking for work or a client needing help, we've got you covered",
      freelancers: {
        title: "For Freelancers",
        description:
          "Find freelance opportunities that align with your skills and career goals. Earn money while building your portfolio.",
        benefits: [
          "Browse projects from clients and businesses",
          "Set your own rates and schedule",
          "Build professional portfolio",
          "Gain real-world experience",
        ],
        joinButton: "Join as Freelancer",
      },
      clients: {
        title: "For Clients",
        description:
          "Find talented freelancers to help with your projects, research, and assignments. Get quality work done efficiently.",
        benefits: [
          "Post projects and assignments",
          "Review freelancer proposals",
          "Choose the best talent",
          "Support freelancer development",
        ],
        joinButton: "Join as Client",
      },
    },
    stats: {
      title: "Platform Statistics",
      subtitle: "See how UniJobs is helping students and teachers connect",
      freelancers: "Freelancers",
      clients: "Clients",
      projects: "Projects",
      earned: "Earned",
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Join thousands of freelancers and clients who are already using UniJobs to connect and collaborate.",
      startAsFreelancer: "Start as Freelancer",
      startAsClient: "Start as Client",
    },
  },
  modal: {
    changeEmail: {
      title: "Change Email",
      description: "Change your email",
      currentPassword: "Current Password",
      newEmail: "New Email",
      sendConfirmationLink: "Send Confirmation Link",
      sending: "Sending...",
      cancel: "Cancel",
      thisWindowWillCloseAutomatically: "This window will close automatically.",
    },
    changePassword: {
      title: "Change Password",
      description: "Change your password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updatePassword: "Update Password",
      updating: "Updating...",
      cancel: "Cancel",
      thisWindowWillCloseAutomatically: "This window will close automatically.",
      success: "Success",
      failed: "Failed",
    },
  },
  editProject: {
    title: "Edit Project",
    updateProject: "Update Project",
    saving: "Saving...",
    cancel: "Cancel",
    projectDetails: "Project Details",
    projectTitleRequired: "Project Title *",
    enterProjectTitle: "Enter project title",
    projectDescriptionRequired: "Project Description *",
    describeProjectRequirements:
      "Describe your project requirements, goals, and expectations...",
    budgetRequired: "Budget *",
    enterBudgetAmount: "Enter budget amount",
    budgetTypeRequired: "Budget Type *",
    fixedPrice: "Fixed Price",
    hourlyRate: "Hourly Rate",
    categoryRequired: "Category *",
    selectCategory: "Select category",
    webDevelopment: "Web Development",
    mobileDevelopment: "Mobile Development",
    design: "Design",
    writing: "Writing",
    marketing: "Marketing",
    translation: "Translation",
    dataEntry: "Data Entry",
    other: "Other",
    deadline: "Deadline",
    skillsRequired: "Skills Required",
    eGReactNodeJsUiUxDesign: "e.g., React, Node.js, UI/UX Design",
    separateSkillsWithCommas: "Separate skills with commas",
    projectTimeline: "Project Timeline",
    describeExpectedTimelineMilestones:
      "Describe the expected timeline and milestones...",
    projectImageOptional: "Project Image (Optional)",
    projectPreview: "Project Preview",
    selected: "Selected",
    currentProjectImage: "Current project image",
    noImageSelected: "No image selected",
    chooseImage: "Choose Image",
    loadingProject: "Loading project...",
    projectNotFound: "Project not found",
    invalidFileTypeError:
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
    fileSizeTooLargeError: "File size too large. Maximum size is 5MB.",
    failedToUploadProjectImageError: "Failed to upload project image",
    failedToUpdateProjectError: "Failed to update project",
    updateProjectDetails: "Update your project details",
  },
  // Clients page translations
  clientsPage: {
    hero: {
      title: "For Clients",
      subtitle:
        "Find freelancers with the skills to help you with your projects and tasks",
      postProject: "Post Project",
      browseFreelancers: "Browse Freelancers",
    },
    projects: {
      title: "Past Projects",
      subtitle: "The results of the projects completed by our clients",
    },
    howItWorks: {
      title: "How It Works",
      subtitle:
        "Get your projects completed quickly and efficiently with freelancers who have the skills we offer",
      steps: [
        {
          title: "1. Post Your Project",
          description:
            "Describe your project requirements, budget, and timeline. Our platform helps you create detailed project descriptions easily.",
        },
        {
          title: "2. Review Freelancers",
          description:
            "Get freelancers with the skills you need. Review profiles, ratings, and previous work to find the best fit.",
        },
        {
          title: "3. Get Your Project Completed",
          description:
            "Hire the best freelancer and get your project completed through our platform. Track progress and ensure quality delivery.",
        },
      ],
    },
    benefits: {
      title: "Why Choose UniJobs?",
      subtitle:
        "Find freelancers with the skills to help you with your projects and tasks",
      features: [
        {
          title: "Skilled Freelancers",
          description:
            "Our freelancers are vetted and rated, ensuring you get the best quality work in a timely manner.",
        },
        {
          title: "Affordable Rates",
          description:
            "Competitive rates with flexible payment options for the work you need.",
        },
        {
          title: "Quick Delivery",
          description:
            "Fast turnaround with freelancers available for urgent projects and tight deadlines.",
        },
        {
          title: "Easy Communication",
          description:
            "Connect with freelancers easily through our platform. Share project details and get updates in real-time.",
        },
        {
          title: "Secure Payments",
          description: "Secure payment system with protection for your funds.",
        },
        {
          title: "Wide Range of Skills",
          description:
            "Find freelancers with the skills you need. We have a wide range of skills to choose from.",
        },
      ],
    },
    popularCategories: {
      title: "Popular Categories",
      subtitle:
        "Find freelancers with the skills you need. We have a wide range of skills to choose from.",
      categories: [
        {
          title: "Web Development",
          description:
            "Web development, app development, and digital marketing.",
        },
        {
          title: "Content Writing",
          description: "Blog posts, articles, and writing for academic papers.",
        },
        {
          title: "Data Analysis",
          description: "Research, statistics, and important data.",
        },
        {
          title: "Design",
          description: "Logo, graphic, and academic writing.",
        },
      ],
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Join thousands of freelancers and clients who are already using UniJobs to connect and collaborate.",
      postFirstProject: "Post Your First Project",
      browseFreelancers: "Browse Freelancers",
    },
  },
  proposePage: {
    loading: "Loading...",
    emailVerificationRequired: "Email Verification Required",
    emailVerificationMessage:
      "You must verify your email address before you can submit proposals or register for projects.",
    emailVerificationRedirect:
      "You will be redirected to the home page shortly.",
    submitProposal: "Submit Proposal",
    viewMyProposals: "View My Proposals",
    projectDetails: "Project Details",
    rating: "⭐ ",
    newClient: "New client",
    budget: "Budget",
    type: "Type",
    category: "Category",
    requiredSkills: "Required Skills",
    submittingAs: "You are submitting as",
    proposalDetails: "Proposal Details",
    coverLetterLabel: "Cover Letter *",
    coverLetterPlaceholder:
      "Introduce yourself and explain why you're the best fit for this project...",
    proposedBudgetLabel: "Proposed Budget (₭) *",
    proposedBudgetPlaceholder: "Enter your proposed budget",
    hourlyRateLabel: "Hourly Rate (₭) *",
    hourlyRatePlaceholder: "Enter your hourly rate",
    estimatedDurationLabel: "Estimated Duration *",
    selectDuration: "Select duration",
    lessThanOneWeek: "Less than 1 week",
    oneToTwoWeeks: "1-2 weeks",
    twoToFourWeeks: "2-4 weeks",
    oneToTwoMonths: "1-2 months",
    twoToThreeMonths: "2-3 months",
    moreThanThreeMonths: "More than 3 months",
    workPlanLabel: "Work Plan",
    workPlanPlaceholder: "Describe your approach to completing this project...",
    communicationPreferencesLabel: "Communication Preferences",
    communicationPreferencesPlaceholder: "e.g., Email, Phone, Zoom, etc.",
    availabilityLabel: "Availability",
    availabilityPlaceholder: "e.g., Weekdays after 6pm, Weekends, etc.",
    workSamplesLabel: "Work Samples (Optional)",
    workSamplesUploadHint:
      "Click or drag files here to upload (images, PDFs, docs, max 10MB)",
    uploading: "Uploading...",
    milestonesLabel: "Milestones (Optional)",
    addMilestone: "Add Milestone",
    milestoneTitlePlaceholder: "Milestone Title",
    milestoneDueDatePlaceholder: "Due Date (YYYY-MM-DD)",
    milestoneDescriptionPlaceholder: "Milestone Description",
    milestoneBudgetPlaceholder: "Budget (₭)",
    cancel: "Cancel",
    add: "Add",
    proposalSummary: "Proposal Summary",
    hourlyRate: "Hourly Rate",
    estimatedDuration: "Estimated Duration",
    dueDate: "Due Date",
    submitting: "Submitting...",
    milestoneDueDateLabel: "Milestone Due Date *",
  },
  pay: {
    title: "Subscription Payment",
    breadcrumb: {
      pricing: "Pricing",
      payLAK: "Pay in LAK",
    },
    instructions: {
      part1: "Scan and pay",
      part2: "using the QR code below.",
    },
    plan: "Subscription Plan",
    total: "Total",
    buttons: {
      paid: "I’ve Paid",
      contact: "Need help? Contact Support",
    },
    tip: {
      text: "📸 After payment, please screenshot the receipt and send it to admin with your Transaction ID for faster confirmation.",
    },
    confirmation: {
      success:
        "✅ Payment submitted! Your transaction is pending admin verification.",
      failed: "❌ Failed to record payment. Please try again.",
      login: "⚠️ Please sign in first.",
    },
    transaction: {
      idLabel: "Your Transaction ID:",
      note: "Keep this ID for reference or send it to the admin for faster verification.",
    },
  },
  topup: {
    title: "Top-Up Balance",
    subtitle: "Add credits to your account easily using QR payment.",
    currentCredit: "Current Balance",
    enterAmount: "Enter Top-Up Amount",
    amount: "Amount",
    total: "Total",
    confirmButton: "Confirm Payment",
    processing: "Processing...",
    back: "← Back to Dashboard",
    tipAmount: "Minimum ₭10,000 — increments of ₭10,000",
    qrNote: "Scan this QR code using your banking app to complete your top-up.",
    tipNote:
      "📸 After payment, please screenshot your receipt and send it to admin for faster verification.",
    confirmation: {
      login: "⚠️ Please sign in first.",
      min: "⚠️ Minimum top-up is ₭10,000.",
      success: "✅ Top-up recorded! Waiting for admin confirmation.",
      failed: "❌ Failed to submit top-up. Please try again later.",
    },
    transaction: {
      idLabel: "Your Transaction ID:",
      note: "Keep this ID for reference or send it to admin for confirmation.",
    },
  },

  transactions: {
    title: "Transaction History",
    subtitle: "View your subscription payments and top-ups",
    loading: "Loading your transactions...",
    empty: "No transactions found.",
    back: "Back to Dashboard",
    signInPrompt: "Please sign in to view your transactions.",

    columns: {
      type: "Type",
      plan: "Plan",
      amount: "Amount",
      method: "Method",
      status: "Status",
      date: "Date",
      id: "Transaction ID",
    },
    stats: {
      totalTopup: "Total Top-ups",
      escrowHeld: "Total Escrow Held",
      refunded: "Total Refunded",
    },
    types: {
      subscription: "Subscription",
      topup: "Top-up",
      escrowHold: "Escrow Hold",
      escrowRelease: "Escrow Release",
      escrowRefund: "Escrow Refund",
      withdrawRequest: "Withdraw Request",
      refund: "Refund",
      escrowAdd: "Escrow Add",
    },
    status: {
      held: "Held",
      released: "Released",
      refunded: "Refunded",
      confirmed: "Confirmed",
      pending: "Pending",
      failed: "Failed",
    },
  },

  withdraw: {
    title: "Withdraw Request",
    creditBalance: "Credit Balance",
    totalEarned: "Total Earned",
    accountName: "Account Full Name",
    accountNumber: "Account / PromptPay Number",
    withdrawFrom: "Withdraw From",
    options: {
      credit: "Credit Balance",
      totalEarned: "Total Earned",
      all: "All Balances",
    },
    amount: "Amount (LAK)",
    submit: "Request Withdraw",
    processing: "Processing...",
    success: "✅ Withdraw request sent successfully!",
    allButton: "All",
    errors: {
      invalidAmount: "⚠️ Please enter a valid amount.",
      insufficientCredit: "⚠️ Insufficient credit balance.",
      insufficientTotalEarned: "⚠️ Insufficient total earned balance.",
      insufficientBalance: "⚠️ Insufficient total balance.",
      failed: "Failed to send request",
      unknown: "⚠️ Something went wrong. Please try again later.",
    },
    confirm: {
      title: "Confirm Withdrawal",
      from: "From",
      amount: "Amount",
      fee: "Fee",
      noFee: "No fee (Freelancer Student)",
      net: "Net You Receive",
      cancel: "Cancel",
      confirm: "Confirm Withdraw",
      breakdownPrefix: "Includes ",
      breakdownMid: " from credit + ",
      breakdownSuffix: " from total earned.",
    },
    summary: {
      title: "Available Balances",
      credit: "Credit Balance",
      earned: "Total Earned",
    },
    history: {
      title: "Withdraw History",
      empty: "No withdraw requests yet.",
    },
    status: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
    method: {
      manual_bank_transfer: "Manual Bank Transfer",
      credit_balance: "Credit Balance",
      promptpay: "PromptPay Transfer",
    },
  },
  rating: {
    rateFreelancer: "Rate Freelancer",
    rateClient: "Rate Client",
    ratingLabel: "Rating",
    subtitle: "How was your experience working together?",
    placeholder: "Leave a comment about your experience (optional)...",
    submit: "Submit Rating",
    thankYou: "Thank you for your feedback!",
    communication: "Communication",
    quality: "Quality of Work",
    timeliness: "Timeliness",
    value: "Value for Money",
  },
  myProjects: {
    title: "My Project Handler",
    stepper: {
      step1: {
        title: "Project Not Started",
        desc: "Waiting for the freelancer to begin work.",
        button: "Start Project",
      },
      step2: {
        title: "Project In Progress",
        desc: "Upload multiple preview images or samples for the client to review before completion.",
        uploadBtn: "Upload Previews",
        uploading: "Uploading...",
        uploadFirst: "Please upload at least one preview before submitting.",
        notePlaceholder: "Add a note or description for the client...",
        submitBtn: "Submit for Review",
        submitting: "Submitting...",
        clientWaitingTitle: "Waiting for Freelancer Submission",
        clientWaitingDesc:
          "The freelancer is currently working on this project. You’ll be notified when they submit previews for review.",
        previewSectionTitle: "Sample Previews",
        finalSectionTitle: "Final / Original Files",
        finalSectionDesc:
          "Upload your final or source files (any type) once the project is approved.",
        saveOriginalsBtn: "Save Originals",
        noPreviewUploaded: "No previews uploaded yet.",
        uploadSuccess: "Final files uploaded successfully!",
        uploadPreviewRequired: "Please upload at least one preview sample.",
        uploadOriginalRequired: "Please upload at least one original file.",
        uploadPreviewAndOriginal:
          "Please upload both a sample preview and an original file before submitting.",
      },
      step3: {
        title: "Client Review",
        desc: "Review submitted previews from the freelancer and approve or request changes.",
        noSubmissions: "No submissions found yet.",
        approve: "Approve and Complete",
        requestChanges: "Request Changes",
        quotaRemaining: "left",
        noQuota: "No edit quota remaining — approval only.",
        confirmApprove: "Confirm Approval",
        confirmApproveDesc:
          "Are you sure you want to mark this project as completed?",
        selectReason: "Type of Request",
        reasonPlaceholder: "Select reason",
        waitingFreelancer: "Waiting for freelancer to respond to your request.",
        pendingChangeRequests: "Pending Change Requests",
        pendingChangeRequestsDesc:
          "You can review and decide whether to accept or reject the client's requested changes.",
        noChangeRequests: "No pending change requests at the moment.",
        confirmAcceptTitle: "Accept Change Request?",
        confirmAcceptDesc:
          "Confirm that you will make the requested changes. The project will move back to 'In Progress'.",
        rejectRequestTitle: "Reject Change Request",
        rejectReason: "Reason for rejecting",
        rejectReasonPlaceholder: "Describe why you reject this request...",
      },
      step4: {
        title: "Project Completed",
        descFreelancer:
          "Your project is completed and files have been delivered successfully.",
      },
      finalDelivery: {
        title: "Final Deliverables",
        descClient:
          "Your project has been marked as completed. You can download the final deliverables below.",
        noFiles: "No files available for download.",
      },
    },
  },
};

export default en;
