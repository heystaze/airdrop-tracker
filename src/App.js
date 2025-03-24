import React, { useState, useEffect } from 'react';
import './App.css';
import { FaTrash, FaEdit, FaStar, FaClipboardList } from 'react-icons/fa';
import { Analytics } from '@vercel/analytics/react'; // Import the Analytics component

function App() {
  const [projects, setProjects] = useState(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects'));
    return savedProjects || [];
  });

  const [completedProjects, setCompletedProjects] = useState(() => {
    const savedCompleted = JSON.parse(localStorage.getItem('completedProjects'));
    return savedCompleted || [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    funding: '',
    priority: 1,
    guide: '',
    status: '⬜',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [theme, setTheme] = useState('teal');
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('completedProjects', JSON.stringify(completedProjects));
  }, [completedProjects]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  const sortedProjects = [...projects].sort((a, b) => b.priority - a.priority);
  const sortedCompletedProjects = [...completedProjects].sort((a, b) => b.priority - a.priority);

  const filteredProjects = sortedProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedProjects = sortedCompletedProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (project = null, index = null) => {
    if (project) {
      setNewProject({ ...project });
      setEditIndex(index);
    } else {
      setNewProject({ name: '', funding: '', priority: 1, guide: '', status: '⬜' });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewProject({ name: '', funding: '', priority: 1, guide: '', status: '⬜' });
    setEditIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && value.length > 20) return;
    setNewProject({ ...newProject, [name]: value });
  };

  const handlePriorityChange = (priority) => {
    setNewProject({ ...newProject, priority });
  };

  const saveProject = () => {
    if (!newProject.name.trim()) return;
    if (editIndex !== null) {
      const updatedProjects = [...projects];
      updatedProjects[editIndex] = {
        ...newProject,
        funding: newProject.funding || 'N/A',
        guide: newProject.guide || 'N/A',
      };
      setProjects(updatedProjects);
    } else {
      setProjects([...projects, {
        ...newProject,
        funding: newProject.funding || 'N/A',
        guide: newProject.guide || 'N/A',
      }]);
    }
    closeModal();
  };

  const deleteProject = (index, isCompleted = false) => {
    if (isCompleted) {
      setCompletedProjects(completedProjects.filter((_, i) => i !== index));
    } else {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const toggleStatus = (index, project) => {
    const updatedProject = { ...project, status: project.status === '⬜' ? '✅' : '⬜' };
    if (updatedProject.status === '✅') {
      setProjects(projects.filter((_, i) => i !== index));
      setCompletedProjects([...completedProjects, updatedProject]);
    } else {
      setCompletedProjects(completedProjects.filter((_, i) => i !== index));
      setProjects([...projects, updatedProject]);
    }
  };

  const renderStars = (priority) => {
    return (
      <div className="priority-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= priority ? 'star filled' : 'star'}
          />
        ))}
      </div>
    );
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderGuide = (guide) => {
    if (isValidUrl(guide)) {
      return (
        <a href={guide} target="_blank" rel="noopener noreferrer" className="guide-link">
          {guide}
        </a>
      );
    }
    return guide;
  };

  const renderNoProjects = () => {
    return (
      <div className="no-projects">
        <FaClipboardList className="no-projects-icon" />
        <h3>No Projects Yet</h3>
        <p>You haven't added any projects to your dashboard. Get started by clicking the button below to add your first project.</p>
        <button className="add-btn" onClick={() => openModal()}>+ Add Your First Project</button>
      </div>
    );
  };

  return (
    <div className={`App ${mode} ${theme}`}>
      {/* Header Section with Title and Toggles */}
      <div className="header">
        <h1>Airdrop Tracker</h1>
        <div className="theme-toggle">
          <label>Theme: </label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="teal">Teal</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
          </select>
          <label>Mode: </label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 && filteredCompletedProjects.length === 0 ? (
        renderNoProjects()
      ) : (
        <>
          <button className="add-btn" onClick={() => openModal()}>+ Add Project</button>

          <h2>Active Projects</h2>
          {filteredProjects.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Funding</th>
                    <th>Priority</th>
                    <th>Guide</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.name}</td>
                      <td>{project.funding}</td>
                      <td>{renderStars(project.priority)}</td>
                      <td>{renderGuide(project.guide)}</td>
                      <td>
                        <span
                          className="status"
                          onClick={() => toggleStatus(index, project)}
                          style={{ cursor: 'pointer' }}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => openModal(project, index)}>
                          <FaEdit />
                        </button>
                        <button className="delete-btn" onClick={() => deleteProject(index)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No active projects found.</p>
          )}

          <h2>Completed Projects</h2>
          {filteredCompletedProjects.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Funding</th>
                    <th>Priority</th>
                    <th>Guide</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompletedProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.name}</td>
                      <td>{project.funding}</td>
                      <td>{renderStars(project.priority)}</td>
                      <td>{renderGuide(project.guide)}</td>
                      <td>
                        <span
                          className="status"
                          onClick={() => toggleStatus(index, project)}
                          style={{ cursor: 'pointer' }}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => deleteProject(index, true)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No completed projects found.</p>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"></div>
            <div className="modal-content">
              <label>Project Name (max 20 characters)</label>
              <input
                type="text"
                name="name"
                value={newProject.name}
                onChange={handleInputChange}
                maxLength={20}
              />
              <label>Funding (e.g. $500K, $5M) (optional)</label>
              <input
                type="text"
                name="funding"
                value={newProject.funding}
                onChange={handleInputChange}
              />
              <label>Priority (1-5)</label>
              <div className="priority-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= newProject.priority ? 'star filled' : 'star'}
                    onClick={() => handlePriorityChange(star)}
                  />
                ))}
              </div>
              <label>Guide Link (optional)</label>
              <input
                type="text"
                name="guide"
                value={newProject.guide}
                onChange={handleInputChange}
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={saveProject}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add the Analytics component */}
      <Analytics />

      {/* Footer Section */}
      <footer className="footer">
        <p>
          Inspired by an airdrop tracking website • Developed and Enhanced by{' '}
          <a href="https://x.com/Zun2025" target="_blank" rel="noopener noreferrer" className="footer-link">
            Zun
          </a>
          {' '}• Modified by{' '}
          <a href="https://x.com/heyst3ze" target="_blank" rel="noopener noreferrer" className="footer-link">
            heystaze
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;