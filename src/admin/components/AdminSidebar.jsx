import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import {
  FiHome,
  FiShield,
  FiBarChart,
  FiBook,
  FiUsers,
  FiGlobe,
  FiSettings,
  FiActivity,
  FiHeadphones,
  FiUser,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiChevronUp,
  FiChevronDown,
  FiMoon,
  FiSun,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiPieChart,
  FiDownload,
  FiList,
  FiEdit,
  FiSliders,
  FiCopy,
  FiFolderPlus,
  FiUpload,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiMonitor,
  FiLink,
  FiDatabase,
  FiFlag,
  FiMessageSquare,
  FiHelpCircle,
  FiLock,
} from 'react-icons/fi';
import Logo from '../../shared/assets/Logo.svg';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logout } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(true);

  // Function to handle sidebar toggle with event dispatch
  const toggleSidebar = (newState) => {
    setIsOpen(newState);
    // Dispatch custom event to notify layout
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { isOpen: newState }
    }));
  };
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    moderation: false,
    analytics: false,
    dictionary: false,
    users: false,
    integrations: false,
    settings: false,
    audit: false,
    profile: false,
  });

  const accountMenuRef = useRef(null);

  const handleLogoutClick = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      // If the section is already open, close it
      if (prev[section]) {
        return {
          ...prev,
          [section]: false
        };
      }
      // If the section is closed, close all others and open this one
      return {
        dashboard: false,
        moderation: false,
        analytics: false,
        dictionary: false,
        users: false,
        integrations: false,
        settings: false,
        audit: false,
        profile: false,
        [section]: true
      };
    });
  };

  const menuSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FiHome />,
      href: '/admin/dashboard/overview',
      items: []
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: <FiShield />,
      items: [
        { label: 'Flagged Content', href: '/admin/moderation/flagged-content', icon: <FiFlag /> },
        { label: 'Reports', href: '/admin/moderation/reports', icon: <FiMessageSquare /> },
        { label: 'Resolved Cases', href: '/admin/moderation/resolved-cases', icon: <FiCheckCircle /> },
        { label: 'Rules', href: '/admin/moderation/rules', icon: <FiFileText /> },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FiBarChart />,
      items: [
        { label: 'Sentiment Trends', href: '/admin/analytics/sentiment-trends', icon: <FiTrendingUp /> },
        { label: 'Word Frequency', href: '/admin/analytics/word-frequency', icon: <FiPieChart /> },
        { label: 'Web Analytics', href: '/admin/analytics/website-reports', icon: <FiGlobe /> },
        { label: 'Language Analytics', href: '/admin/analytics/language-analytics', icon: <FiGlobe /> },
        { label: 'Export Reports', href: '/admin/analytics/export-reports', icon: <FiDownload /> },
      ]
    },
    {
      id: 'dictionary',
      label: 'Dictionary',
      icon: <FiBook />,
      items: [
        { label: 'Word List', href: '/admin/dictionary/master-list', icon: <FiList /> },
        { label: 'Add/Edit Words', href: '/admin/dictionary/add-edit', icon: <FiEdit /> },

        { label: 'Synonyms', href: '/admin/dictionary/synonyms', icon: <FiCopy /> },
        { label: 'Custom Lists', href: '/admin/dictionary/custom-lists', icon: <FiFolderPlus /> },
        { label: 'Import/Export', href: '/admin/dictionary/import-export', icon: <FiUpload /> },
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: <FiUsers />,
      items: [
        { label: 'End Users', href: '/admin/users/end-users', icon: <FiUser /> },

        { label: 'Admin Accounts', href: '/admin/users/admin-accounts', icon: <FiUserX /> },
        { label: 'Roles & Permissions', href: '/admin/users/roles-permissions', icon: <FiKey /> },
      ]
    },
    //{
    //  id: 'integrations',
    //  label: 'Integrations',
    //  icon: <FiGlobe />,
    //  items: [
    //    { label: 'Domains', href: '/admin/integrations/domains', icon: <FiLink /> },
    //    { label: 'API Keys', href: '/admin/integrations/api-keys', icon: <FiKey /> },
    //    { label: 'Logs', href: '/admin/integrations/logs', icon: <FiDatabase /> },
    //    { label: 'Usage Stats', href: '/admin/integrations/usage-stats', icon: <FiBarChart /> },
    //  ]
    // },
  ];

  const bottomSections = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <FiSettings />,
      items: [
        { label: 'Global Policies', href: '/admin/settings/global-policies', icon: <FiShield /> },
        { label: 'Language Support', href: '/admin/settings/language-support', icon: <FiGlobe /> },
        { label: 'Notifications', href: '/admin/settings/notifications', icon: <FiMessageSquare /> },
        { label: 'System Preferences', href: '/admin/settings/system-preferences', icon: <FiMonitor /> },
      ]
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: <FiActivity />,
      items: [
        { label: 'Admin Activity', href: '/admin/audit/admin-activity', icon: <FiUser /> },

        { label: 'Login Attempts', href: '/admin/audit/login-attempts', icon: <FiLock /> },
        { label: 'Dictionary Changes', href: '/admin/audit/dictionary-changes', icon: <FiBook /> },
      ]
    },
    // {
    //   id: 'support',
    //   label: 'Support',
    //   icon: <FiHeadphones />,
    //   items: [
    //     { label: 'User Reports', href: '/admin/support/user-reports', icon: <FiFlag /> },
    //     { label: 'Feedback', href: '/admin/support/feedback', icon: <FiMessageSquare /> },
    //     { label: 'Help Center', href: '/admin/support/help-center', icon: <FiHelpCircle /> },
    //   ]
    // },
    //{
    //  id: 'profile',
     // label: 'Profile',
    //  icon: <FiUser />,
     // items: [
    //    { label: 'Profile Settings', href: '/admin/profile/settings', icon: <FiUser /> },
     //   { label: 'Change Password', href: '/admin/profile/change-password', icon: <FiLock /> },
    //    { label: 'Security Settings', href: '/admin/profile/security', icon: <FiShield /> },
    //  ]
   //   },
  ];

  const allSections = [...menuSections, ...bottomSections];

  const renderSection = (section) => {
    const isExpanded = expandedSections[section.id];
    const hasActiveItem = section.items.length > 0 ? section.items.some(item => location.pathname === item.href) : location.pathname === section.href;

    // If section has direct href (no sub-items), render as direct link
    if (section.href && section.items.length === 0) {
      const isActive = location.pathname === section.href;
      return (
        <div key={section.id} className="mb-1">
          <button
            onClick={() => navigate(section.href)}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
              isActive
                ? 'bg-[#015763] text-white font-medium'
                : 'text-black hover:bg-[#015763]/10 hover:text-[#015763]'
            }`}
            style={{ fontSize: '14px' }}
          >
            <span className="text-lg flex-shrink-0">{section.icon}</span>
            {isOpen && <span>{section.label}</span>}
          </button>
        </div>
      );
    }

    // Original expandable section logic
    return (
      <div key={section.id} className="mb-1">
        <button
          onClick={() => toggleSection(section.id)}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
            hasActiveItem || isExpanded
              ? 'bg-[#015763]/10 text-black font-medium border-l-2 border-[#015763]'
              : 'text-black hover:bg-[#015763]/5'
          }`}
          style={{ fontSize: '14px' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg flex-shrink-0">{section.icon}</span>
            {isOpen && <span>{section.label}</span>}
          </div>
          {isOpen && (
            <span className="text-sm">
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          )}
        </button>

        {isOpen && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-[#015763] text-white font-medium'
                      : 'text-gray-500 hover:bg-[#015763]/10 hover:text-[#015763]'
                  }`}
                  style={{ fontSize: '13px' }}
                >
                  <span className="text-sm flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={`bg-white h-screen flex flex-col border-r border-gray-200 transition-all duration-300 pt-3 fixed left-0 top-0 z-10 ${
          isOpen ? 'w-80' : 'w-16'
        }`}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
          {!isOpen && (
            <div className="flex items-center mb-16 mt-2 justify-center" style={{ minHeight: 56 }}>
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition mx-auto"
                onClick={() => toggleSidebar(true)}
                aria-label="Open sidebar"
              >
                <FiMenu size={22} />
              </button>
            </div>
          )}
          
          <div className={`flex flex-col ${isOpen ? 'pl-6 pr-3 mt-4' : 'items-center'}`}>
            {isOpen && (
              <>
                <div className="flex items-center mt-1 mb-6">
                  <button
                    className="p-1.5 rounded-full hover:bg-gray-100 transition mr-2"
                    onClick={() => toggleSidebar(false)}
                    aria-label="Close sidebar"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="flex items-end gap-2">
                    <img src={Logo} alt="Murai-Logo" className="h-9" />
                    <span className="text-sm font-medium text-gray-600">Admin</span>
                  </div>
                </div>
                <div className="mb-6 -ml-6 -mr-3"></div>
              </>
            )}
            
            <nav className={`flex flex-col ${isOpen ? 'gap-1 flex-1' : 'items-center gap-1.5'}`}>
              {isOpen ? (
                <div className="space-y-1">
                  {allSections.map(renderSection)}
                </div>
              ) : (
                // Collapsed view - show only main section icons
                allSections.map((section) => {
                  const hasActiveItem = section.items.length > 0 ? section.items.some(item => location.pathname === item.href) : location.pathname === section.href;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        if (section.href && section.items.length === 0) {
                          // Direct navigation for sections with href
                          navigate(section.href);
                        } else {
                          // Expand sidebar and toggle section for expandable sections
                          toggleSidebar(true);
                          toggleSection(section.id);
                        }
                      }}
                      className={`flex items-center justify-center p-2 rounded-lg w-10 h-10 transition-all duration-200 ease-in-out ${
                        hasActiveItem
                          ? 'bg-[#015763] text-white'
                          : 'text-black hover:bg-[#015763]/10 hover:text-[#015763]'
                      }`}
                      aria-label={section.label}
                    >
                      <span className="text-lg flex-shrink-0">{section.icon}</span>
                    </button>
                  );
                })
              )}
            </nav>
          </div>
        </div>
        
        {/* Bottom section with user info and logout */}
        <div className={`flex flex-col gap-2 mb-3 ${isOpen ? 'px-3' : 'items-center'} relative border-t border-gray-100 pt-3`}>
          {isOpen ? (
            <>
              <div ref={accountMenuRef} className="relative">
                <button
                  className="flex items-center justify-between border border-gray-200 bg-white rounded-lg px-3 py-3 text-gray-700 text-sm font-semibold w-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-300 transition group"
                  onClick={() => setShowAccountMenu((prev) => !prev)}
                  aria-label="Account menu"
                  type="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {(adminUser?.name || 'Admin User').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{adminUser?.name || 'Admin User'}</span>
                      <span className="text-xs text-gray-500 font-normal">{adminUser?.email || 'admin@murai.com'}</span>
                    </div>
                  </div>
                  {showAccountMenu ? <FiChevronUp className="text-lg ml-2" /> : <FiChevronDown className="text-lg ml-2" />}
                </button>

                {/* Account Dropdown Menu */}
                {showAccountMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/admin/profile/settings');
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiUser className="h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/admin/profile/change-password');
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiLock className="h-4 w-4" />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        navigate('/admin/profile/security');
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FiShield className="h-4 w-4" />
                      Security Settings
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        handleLogoutClick();
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
              aria-label="Logout"
              onClick={handleLogoutClick}
              type="button"
            >
              <FiLogOut size={22} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
