import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { categoryService } from '../services/api';

const Settings = () => {
  // State variables
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Function to load categories from API
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to load categories. Please try again later.');
      setIsLoading(false);
    }
  };

  // Handle category status toggle
  const toggleCategoryStatus = async (categoryId) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const updatedCategory = {...category, active: !category.active};
      await categoryService.updateCategory(categoryId, updatedCategory);
      
      // Update local state
      setCategories(categories.map(c => 
        c.id === categoryId ? updatedCategory : c
      ));
      
      setSuccessMessage('Category status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update category status. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle category deletion
  const deleteCategory = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      
      // Update local state
      setCategories(categories.filter(c => c.id !== categoryId));
      
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to delete category. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle adding a new category
  const addNewCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      setIsSaving(true);
      const newCategory = {
        name: newCategoryName.trim(),
        active: true
      };
      
      const response = await categoryService.createCategory(newCategory);
      
      // Update local state with the returned category (which includes the ID)
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setSuccessMessage('New category added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsSaving(false);
    } catch (error) {
      setErrorMessage('Failed to add new category. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="row">
        <div className="col-lg-12">
          {/* Success message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {errorMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setErrorMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Course Categories */}
          <motion.div 
            className="card border-0 shadow-sm mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Course Categories</h5>
              <span className="badge bg-primary">{categories.length}</span>
            </div>
            <div className="card-body p-0">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {categories.length === 0 ? (
                    <div className="list-group-item text-center">
                      No categories found. Add your first category below.
                    </div>
                  ) : (
                    categories.map(category => (
                      <div 
                        className="list-group-item d-flex justify-content-between align-items-center" 
                        key={category.id}
                      >
                        <div>
                          <span className={category.active ? '' : 'text-muted text-decoration-line-through'}>
                            {category.name}
                          </span>
                          {!category.active && (
                            <span className="badge bg-secondary ms-2">Inactive</span>
                          )}
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button 
                            type="button" 
                            className={`btn btn-outline-${category.active ? 'warning' : 'success'}`}
                            onClick={() => toggleCategoryStatus(category.id)}
                            title={category.active ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${category.active ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-danger"
                            onClick={() => deleteCategory(category.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="card-footer bg-white py-3">
              <form onSubmit={addNewCategory} className="d-flex">
                <input 
                  type="text" 
                  className="form-control me-2" 
                  placeholder="New category name" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-1"></i> Add
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 