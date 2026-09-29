'use client';

import React, { useState, useEffect } from 'react';
import { School, SchoolClass, UniformType, Product, CatalogAvailability } from '@/types';
import {
  fetchAllSchoolsAdmin,
  createSchoolAdmin,
  updateSchoolAdmin,
  fetchSchoolClasses,
  createClassAdmin,
  updateClassAdmin,
  fetchClassUniformTypes,
  createUniformTypeAdmin,
  updateUniformTypeAdmin,
  fetchMasterCatalog,
  createProduct,
  updateProductCatalogDetails,
  fetchCategories
} from '@/services/api';
import { useApp } from '@/context/AppContext';

export default function StaffMasterCatalogManager() {
  const { showToast } = useApp();

  // Navigation Drilldown State
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  const [selectedUniformType, setSelectedUniformType] = useState<UniformType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter in Products view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showAddUniformTypeModal, setShowAddUniformTypeModal] = useState(false);
  const [showEditUniformTypeModal, setShowEditUniformTypeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // School Form State
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [schoolStudents, setSchoolStudents] = useState('2500');

  // Class Form State
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classOrder, setClassOrder] = useState('1');

  // Uniform Type Form State
  const [uniformName, setUniformName] = useState('');
  const [uniformSlug, setUniformSlug] = useState('');
  const [uniformImage, setUniformImage] = useState('');
  const [uniformOrder, setUniformOrder] = useState('1');

  // Product Form & Matrix Editor State
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(450);
  const [prodOrigPrice, setProdOrigPrice] = useState<number>(550);
  const [prodCategory, setProdCategory] = useState('Shirts');
  const [prodGender, setProdGender] = useState<'BOYS' | 'GIRLS' | 'UNISEX'>('UNISEX');
  const [prodStatus, setProdStatus] = useState<CatalogAvailability>('AVAILABLE');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [newImageInput, setNewImageInput] = useState('');
  const [prodVariants, setProdVariants] = useState<Array<{ id?: string; size: string; price: number; isAvailable: boolean }>>([]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [prodDisplayOrder, setProdDisplayOrder] = useState('0');

  // Initial Load: Fetch Schools & Categories
  const loadSchools = () => {
    setLoading(true);
    Promise.all([fetchAllSchoolsAdmin(), fetchCategories()])
      .then(([schRes, catRes]) => {
        if (schRes.schools) {
          setSchools(schRes.schools);
          if (selectedSchool) {
            const refreshed = schRes.schools.find((s: School) => s.id === selectedSchool.id);
            if (refreshed) setSelectedSchool(refreshed);
          }
        }
        if (catRes.categories) {
          setCategories(catRes.categories);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Load Classes when School is selected
  const loadSchoolClasses = (schoolId: string) => {
    setLoading(true);
    fetchSchoolClasses(schoolId)
      .then(res => {
        if (res.classes) {
          setClasses(res.classes);
          if (selectedClass) {
            const refCls = res.classes.find((c: SchoolClass) => c.id === selectedClass.id);
            if (refCls) setSelectedClass(refCls);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Load Uniform Types when Class is selected
  const loadClassUniformTypes = (classId: string) => {
    setLoading(true);
    fetchClassUniformTypes(classId)
      .then(res => {
        if (res.uniformTypes) {
          setUniformTypes(res.uniformTypes);
          if (selectedUniformType) {
            const refUt = res.uniformTypes.find((u: UniformType) => u.id === selectedUniformType.id);
            if (refUt) setSelectedUniformType(refUt);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Load Products when Uniform Type or Class is selected
  const loadProducts = () => {
    if (!selectedSchool) return;
    setLoading(true);
    fetchMasterCatalog({
      schoolId: selectedSchool.id,
      classId: selectedClass?.id,
      uniformTypeId: selectedUniformType?.id
    })
      .then(res => {
        if (res.products) {
          setProducts(res.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedSchool && selectedClass && selectedUniformType) {
      loadProducts();
    }
  }, [selectedSchool?.id, selectedClass?.id, selectedUniformType?.id]);

  // Handle Drilldowns
  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setSelectedClass(null);
    setSelectedUniformType(null);
    loadSchoolClasses(school.id);
  };

  const handleSelectClass = (cls: SchoolClass) => {
    setSelectedClass(cls);
    setSelectedUniformType(null);
    loadClassUniformTypes(cls.id);
  };

  const handleSelectUniformType = (ut: UniformType) => {
    setSelectedUniformType(ut);
  };

  // School Actions
  const handleCreateSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createSchoolAdmin({
        name: schoolName,
        code: schoolCode,
        address: schoolAddress,
        contactEmail: schoolEmail,
        phone: schoolPhone,
        logoUrl: schoolLogo || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80',
        totalStudents: schoolStudents
      });
      if (res.error) showToast(`Error: ${res.error}`);
      else {
        showToast(`School ${schoolName} created successfully with default classes!`);
        setShowAddSchoolModal(false);
        setSchoolName('');
        setSchoolCode('');
        setSchoolAddress('');
        setSchoolEmail('');
        loadSchools();
      }
    } catch {
      showToast('Failed to create school');
    }
  };

  const handleToggleSchoolStatus = async (school: School) => {
    const nextStatus = school.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await updateSchoolAdmin(school.id, { status: nextStatus });
    if (res.error) showToast(`Error: ${res.error}`);
    else {
      showToast(`School ${school.name} marked ${nextStatus}`);
      loadSchools();
    }
  };

  // Class Actions
  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    try {
      const res = await createClassAdmin(selectedSchool.id, {
        name: className,
        code: classCode,
        displayOrder: classOrder
      });
      if (res.error) showToast(`Error: ${res.error}`);
      else {
        showToast(`${className} added to ${selectedSchool.name}!`);
        setShowAddClassModal(false);
        setClassName('');
        setClassCode('');
        loadSchoolClasses(selectedSchool.id);
      }
    } catch {
      showToast('Failed to create class');
    }
  };

  // Uniform Type Actions
  const handleCreateUniformTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      const res = await createUniformTypeAdmin(selectedClass.id, {
        name: uniformName,
        slug: uniformSlug || uniformName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        imageUrl: uniformImage || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        displayOrder: uniformOrder
      });
      if (res.error) showToast(`Error: ${res.error}`);
      else {
        showToast(`Uniform category "${uniformName}" added to ${selectedClass.name}!`);
        setShowAddUniformTypeModal(false);
        setUniformName('');
        setUniformSlug('');
        loadClassUniformTypes(selectedClass.id);
      }
    } catch {
      showToast('Failed to create uniform type');
    }
  };

  // Open Product Modal (Create or Edit)
  const handleOpenProductEditor = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdSku(prod.sku || '');
      setProdDesc(prod.description);
      setProdPrice(prod.price || prod.basePrice || 450);
      setProdOrigPrice(prod.originalPrice || prod.basePrice || 550);
      setProdCategory(prod.category || 'Shirts');
      setProdGender((prod.gender as any) || 'UNISEX');
      setProdStatus(prod.availabilityStatus || 'AVAILABLE');
      setProdImages(prod.images || []);
      setProdDisplayOrder((prod.displayOrder || 0).toString());

      if (prod.variants && prod.variants.length > 0) {
        setProdVariants(
          prod.variants.map(v => ({
            id: v.id,
            size: v.size,
            price: v.price,
            isAvailable: v.isAvailable !== false
          }))
        );
      } else if (prod.sizes && prod.sizes.length > 0) {
        setProdVariants(
          prod.sizes.map(s => ({
            size: s,
            price: prod.price || 450,
            isAvailable: true
          }))
        );
      } else {
        setProdVariants([
          { size: '28', price: 450, isAvailable: true },
          { size: '30', price: 450, isAvailable: true },
          { size: '32', price: 450, isAvailable: true },
          { size: '34', price: 450, isAvailable: true },
          { size: '36', price: 450, isAvailable: true }
        ]);
      }
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdSku(`${selectedSchool?.code || 'SCH'}-${selectedClass?.name.replace(/[^0-9]/g, '') || '5'}-${Date.now().toString().slice(-4)}`);
      setProdDesc('Standard institutional approved uniform fabric with reinforced stitching.');
      setProdPrice(450);
      setProdOrigPrice(550);
      setProdCategory('Shirts');
      setProdGender('UNISEX');
      setProdStatus('AVAILABLE');
      setProdImages(['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80']);
      setProdDisplayOrder('0');
      setProdVariants([
        { size: '28', price: 450, isAvailable: true },
        { size: '30', price: 450, isAvailable: true },
        { size: '32', price: 450, isAvailable: true },
        { size: '34', price: 450, isAvailable: true },
        { size: '36', price: 450, isAvailable: true }
      ]);
    }
    setShowProductModal(true);
  };

  // Add Size to Matrix in Editor
  const handleAddSizeToMatrix = () => {
    if (!newSizeInput.trim()) return;
    if (prodVariants.some(v => v.size.toLowerCase() === newSizeInput.trim().toLowerCase())) {
      showToast(`Size ${newSizeInput} is already in the matrix.`);
      return;
    }
    setProdVariants([...prodVariants, { size: newSizeInput.trim(), price: prodPrice, isAvailable: true }]);
    setNewSizeInput('');
  };

  // Toggle Size Availability in Matrix
  const handleToggleSizeAvailability = (index: number) => {
    const updated = [...prodVariants];
    updated[index].isAvailable = !updated[index].isAvailable;
    setProdVariants(updated);
  };

  // Remove Size from Matrix
  const handleRemoveSizeFromMatrix = (index: number) => {
    const updated = [...prodVariants];
    updated.splice(index, 1);
    setProdVariants(updated);
  };

  // Image Upload / Add in Editor
  const handleAddImage = () => {
    if (!newImageInput.trim()) return;
    setProdImages([...prodImages, newImageInput.trim()]);
    setNewImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...prodImages];
    updated.splice(index, 1);
    setProdImages(updated);
  };

  // Save Product Changes (Propagate to PostgreSQL)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool || !selectedClass || !selectedUniformType) {
      showToast('Please select School, Class, and Uniform Type hierarchy.');
      return;
    }

    try {
      const matchedCat = categories.find(c => c.name.toLowerCase() === prodCategory.toLowerCase()) || categories[0];

      if (editingProduct) {
        // Update existing product
        const res = await updateProductCatalogDetails(editingProduct.id, {
          name: prodName,
          basePrice: prodPrice,
          originalPrice: prodOrigPrice,
          description: prodDesc,
          availabilityStatus: prodStatus,
          displayOrder: parseInt(prodDisplayOrder) || 0,
          images: prodImages,
          variants: prodVariants
        });

        if (res.error) showToast(`Error: ${res.error}`);
        else {
          showToast(`✓ Master Catalog updated for "${prodName}"! All student, customer & employee views refreshed.`);
          setShowProductModal(false);
          loadProducts();
        }
      } else {
        // Create new product
        const res = await createProduct({
          name: prodName,
          sku: prodSku,
          description: prodDesc,
          categoryId: matchedCat?.id || categories[0]?.id,
          gender: prodGender,
          basePrice: prodPrice,
          originalPrice: prodOrigPrice,
          images: prodImages,
          schoolId: selectedSchool.id,
          classId: selectedClass.id,
          uniformTypeId: selectedUniformType.id,
          displayOrder: parseInt(prodDisplayOrder) || 0,
          availabilityStatus: prodStatus,
          variants: prodVariants
        });

        if (res.error) showToast(`Error: ${res.error}`);
        else {
          showToast(`✓ New uniform "${prodName}" created and linked to ${selectedSchool.name} → ${selectedClass.name}!`);
          setShowProductModal(false);
          loadProducts();
        }
      }
    } catch {
      showToast('Failed to save product in master catalog');
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.availabilityStatus === statusFilter || (statusFilter === 'ACTIVE' && p.status === 'ACTIVE');
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Hierarchy Breadcrumb Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold mb-3">
          <button
            onClick={() => {
              setSelectedSchool(null);
              setSelectedClass(null);
              setSelectedUniformType(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              !selectedSchool ? 'bg-orange-500 text-white shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">domain</span> 1. Partner Schools
          </button>

          <span className="text-slate-500">/</span>

          <button
            disabled={!selectedSchool}
            onClick={() => {
              setSelectedClass(null);
              setSelectedUniformType(null);
              if (selectedSchool) loadSchoolClasses(selectedSchool.id);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedSchool && !selectedClass
                ? 'bg-orange-500 text-white shadow'
                : selectedSchool
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-sm">school</span> 2. {selectedSchool ? selectedSchool.name : 'Select School'}
          </button>

          <span className="text-slate-500">/</span>

          <button
            disabled={!selectedClass}
            onClick={() => {
              setSelectedUniformType(null);
              if (selectedClass) loadClassUniformTypes(selectedClass.id);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedClass && !selectedUniformType
                ? 'bg-orange-500 text-white shadow'
                : selectedClass
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-sm">hotel_class</span> 3. {selectedClass ? selectedClass.name : 'Select Class'}
          </button>

          <span className="text-slate-500">/</span>

          <span
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedUniformType ? 'bg-emerald-600 text-white font-black shadow' : 'opacity-40 bg-slate-800/40 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-sm">checkroom</span> 4. {selectedUniformType ? selectedUniformType.name : 'Uniform Category'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
              Master Catalog Control Center
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              One central source of truth. Any price, image, size, or availability edit made here updates the database and immediately reflects across Parent/Student, Customer, and Employee views.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!selectedSchool && (
              <button
                onClick={() => setShowAddSchoolModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add New School
              </button>
            )}

            {selectedSchool && !selectedClass && (
              <button
                onClick={() => setShowAddClassModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Class to {selectedSchool.code}
              </button>
            )}

            {selectedClass && !selectedUniformType && (
              <button
                onClick={() => setShowAddUniformTypeModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Uniform Category
              </button>
            )}

            {selectedUniformType && (
              <button
                onClick={() => handleOpenProductEditor()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Add Uniform Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LEVEL 1: SCHOOLS OVERVIEW */}
      {/* ============================================================ */}
      {!selectedSchool && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#102a43]">Partner Schools Directory ({schools.length})</h3>
            <span className="text-xs text-gray-500 font-medium">Click on any school to configure its Classes & Uniform Types</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {schools.map(sch => (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={sch.logoUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80'} alt={sch.name} className="w-full h-full object-cover" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        sch.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-[#102a43] leading-snug">{sch.name}</h4>
                  <p className="text-[11px] font-bold text-orange-600 mt-0.5">{sch.code}</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{sch.address}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-gray-400 font-bold block">Classes Defined</span>
                      <span className="text-sm font-black text-slate-800">{sch.classesCount || sch.classes?.length || 12}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-gray-400 font-bold block">Active Products</span>
                      <span className="text-sm font-black text-orange-600">{sch.productsCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleSelectSchool(sch)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    Manage Catalog <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => handleToggleSchoolStatus(sch)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      sch.status === 'ACTIVE'
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={sch.status === 'ACTIVE' ? 'Deactivate School' : 'Activate School'}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {sch.status === 'ACTIVE' ? 'block' : 'check_circle'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEVEL 2: CLASSES VIEW (For selected school) */}
      {/* ============================================================ */}
      {selectedSchool && !selectedClass && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={selectedSchool.logoUrl} alt={selectedSchool.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    {selectedSchool.code}
                  </span>
                  <span className="text-xs font-bold text-gray-500">Academic Year: 2025–2026</span>
                </div>
                <h3 className="text-lg font-black text-[#102a43] mt-0.5">{selectedSchool.name}</h3>
                <p className="text-xs text-gray-500">{selectedSchool.address}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSchool(null)}
              className="text-xs font-bold text-gray-500 hover:text-slate-900 flex items-center gap-1 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span> Back to Schools
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-[#102a43]">Classes in {selectedSchool.name} ({classes.length})</h4>
            <span className="text-xs text-gray-500">Select a class to manage its uniform categories</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                className="bg-white rounded-2xl border border-gray-200 hover:border-orange-400 p-4 text-left shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 font-black text-xs flex items-center justify-center mb-3 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {cls.displayOrder || cls.name.replace(/[^0-9]/g, '') || '•'}
                </div>
                <h5 className="text-sm font-black text-[#102a43]">{cls.name}</h5>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                  {cls.uniformTypes?.length || 3} Categories
                </p>
                <div className="mt-3 flex items-center text-[11px] font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                  Configure <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEVEL 3: UNIFORM TYPES VIEW (For selected class) */}
      {/* ============================================================ */}
      {selectedSchool && selectedClass && !selectedUniformType && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                {selectedSchool.name}
              </span>
              <h3 className="text-lg font-black text-[#102a43] mt-1">{selectedClass.name} Uniform Categories</h3>
              <p className="text-xs text-gray-500">Configure Regular, Sports, Winter, or House uniform kits for this grade</p>
            </div>

            <button
              onClick={() => setSelectedClass(null)}
              className="text-xs font-bold text-gray-500 hover:text-slate-900 flex items-center gap-1 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span> Back to Classes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {uniformTypes.map(ut => (
              <div
                key={ut.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-2xl">
                      {ut.slug.includes('sports')
                        ? 'sports_kabaddi'
                        : ut.slug.includes('winter')
                        ? 'ac_unit'
                        : ut.slug.includes('house')
                        ? 'flag'
                        : 'dry_cleaning'}
                    </span>
                  </div>

                  <h5 className="text-base font-black text-[#102a43]">{ut.name}</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {ut.slug.includes('sports')
                      ? 'Athletic kits, PE t-shirts & track pants'
                      : ut.slug.includes('winter')
                      ? 'Institutional blazers, sweaters & jackets'
                      : ut.slug.includes('house')
                      ? 'House color athletic jerseys & caps'
                      : 'Everyday school shirts, trousers & skirts'}
                  </p>

                  <div className="mt-4 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold">Catalog Items:</span>
                    <span className="font-black text-slate-800">{ut.products?.length || ut._count?.products || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectUniformType(ut)}
                  className="mt-5 w-full bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  Manage Products <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LEVEL 4: PRODUCTS & LIVE MATRIX EDITOR */}
      {/* ============================================================ */}
      {selectedSchool && selectedClass && selectedUniformType && (
        <div className="space-y-6">
          {/* Header & Hierarchy Context */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
                <span>{selectedSchool.name}</span>
                <span>•</span>
                <span>{selectedClass.name}</span>
                <span>•</span>
                <span className="text-emerald-600 font-extrabold">{selectedUniformType.name}</span>
              </div>
              <h3 className="text-xl font-black text-[#102a43]">
                {selectedClass.name} — {selectedUniformType.name} Catalog ({filteredProducts.length})
              </h3>
              <p className="text-xs text-gray-500">
                Products configured here are served to Parents/Students selecting {selectedSchool.name} → {selectedClass.name} → {selectedUniformType.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUniformType(null)}
                className="text-xs font-bold text-gray-500 hover:text-slate-900 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span> Back to Uniforms
              </button>

              <button
                onClick={() => handleOpenProductEditor()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span> Add New Uniform
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Products Grid with In-line Edit triggers */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">dry_cleaning</span>
              <h4 className="text-base font-bold text-[#102a43]">No uniform items configured yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Click the &ldquo;Add New Uniform&rdquo; button above to add shirts, pants, ties, or blazers to this uniform category.
              </p>
              <button
                onClick={() => handleOpenProductEditor()}
                className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Add First Uniform Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-24 rounded-xl bg-slate-100 overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase text-gray-400">{p.sku}</span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              p.availabilityStatus === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : p.availabilityStatus === 'OUT_OF_STOCK'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {p.availabilityStatus || 'AVAILABLE'}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-[#102a43] leading-snug line-clamp-2">{p.name}</h4>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-base font-black text-emerald-700">₹{p.price || p.basePrice}</span>
                          {p.originalPrice && p.originalPrice > (p.price || p.basePrice || 0) && (
                            <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">{p.description}</p>

                    {/* Size Availability Badges */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1.5">
                        Sizes & Availability Matrix:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(p.variants && p.variants.length > 0
                          ? p.variants
                          : (p.sizes || ['28', '30', '32']).map(s => ({ size: s, isAvailable: true }))
                        ).map((v: any, idx: number) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              v.isAvailable !== false
                                ? 'bg-slate-100 text-slate-800 border-slate-200'
                                : 'bg-rose-50 text-rose-500 line-through border-rose-200'
                            }`}
                            title={v.isAvailable !== false ? 'Available' : 'Out of Stock'}
                          >
                            {v.size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-bold">Photos: {p.images.length}</span>

                    <button
                      onClick={() => handleOpenProductEditor(p)}
                      className="bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> Edit Details & Sizes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PRODUCT DETAILS & SIZES MATRIX MODAL */}
      {/* ============================================================ */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded">
                  {selectedSchool?.name} • {selectedClass?.name} • {selectedUniformType?.name}
                </span>
                <h3 className="text-xl font-black text-[#102a43] mt-1">
                  {editingProduct ? `Edit Master Uniform: ${editingProduct.name}` : 'Add New Uniform to Master Catalog'}
                </h3>
                <p className="text-xs text-gray-400">Edits sync immediately across all role catalog views</p>
              </div>

              <button
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-gray-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="e.g. Classic White Oxford Formal Shirt"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product SKU *</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    placeholder="e.g. GVPS-C5-SHIRT-W"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="Detailed fabric, fit, and institutional uniform specifications..."
                  className="w-full text-xs font-medium px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Pricing & Availability Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={prodPrice}
                    onChange={e => setProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-black px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={prodOrigPrice}
                    onChange={e => setProdOrigPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-black px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Status</label>
                  <select
                    value={prodStatus}
                    onChange={e => setProdStatus(e.target.value as CatalogAvailability)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                    <option value="COMING_SOON">Coming Soon</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Size & Availability Matrix */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-black text-[#102a43]">Sizes & Size-Level Availability</h4>
                    <p className="text-[11px] text-gray-400">Click the toggle to enable or disable specific sizes</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add Size (e.g. 38, S, 6)"
                      value={newSizeInput}
                      onChange={e => setNewSizeInput(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg w-36"
                    />
                    <button
                      type="button"
                      onClick={handleAddSizeToMatrix}
                      className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {prodVariants.map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        v.isAvailable
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black block">Size {v.size}</span>
                        <span className="text-[10px] font-bold text-gray-400">₹{v.price || prodPrice}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSizeAvailability(idx)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md transition-all ${
                            v.isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {v.isAvailable ? 'Available' : 'Out of Stock'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeFromMatrix(idx)}
                          className="text-gray-400 hover:text-rose-600 text-xs font-bold"
                          title="Remove size"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Photos & Preview */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-black text-[#102a43] mb-2">Product Images ({prodImages.length})</h4>
                <div className="flex flex-wrap gap-3 mb-3">
                  {prodImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={img} alt="Uniform Photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/60 text-white text-xs font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Enter Image URL (https://...)"
                    value={newImageInput}
                    onChange={e => setNewImageInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  {editingProduct ? 'Save Master Changes' : 'Create & Publish Uniform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD NEW SCHOOL MODAL */}
      {/* ============================================================ */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-[#102a43] mb-1">Add Partner School</h3>
            <p className="text-xs text-gray-400 mb-5">Creates school profile with default Classes 1–12 starter template</p>

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={e => setSchoolCode(e.target.value)}
                    placeholder="e.g. DPS-HYD"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Students</label>
                  <input
                    type="number"
                    value={schoolStudents}
                    onChange={e => setSchoolStudents(e.target.value)}
                    placeholder="2500"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={schoolAddress}
                  onChange={e => setSchoolAddress(e.target.value)}
                  placeholder="Road No. 45, Jubilee Hills, Hyderabad"
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={schoolEmail}
                    onChange={e => setSchoolEmail(e.target.value)}
                    placeholder="store@dps.edu.in"
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={schoolPhone}
                    onChange={e => setSchoolPhone(e.target.value)}
                    placeholder="+91 40 2345 6789"
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={schoolLogo}
                  onChange={e => setSchoolLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  Create School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD CLASS MODAL */}
      {/* ============================================================ */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-[#102a43] mb-1">Add Class to {selectedSchool?.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Creates class with Regular, Sports, and Winter categories</p>

            <form onSubmit={handleCreateClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="e.g. Class 5 or Nursery"
                  className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Class Code</label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={e => setClassCode(e.target.value)}
                    placeholder="e.g. C5"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={classOrder}
                    onChange={e => setClassOrder(e.target.value)}
                    placeholder="5"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD UNIFORM TYPE MODAL */}
      {/* ============================================================ */}
      {showAddUniformTypeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-[#102a43] mb-1">Add Uniform Category</h3>
            <p className="text-xs text-gray-400 mb-4">Adding to {selectedClass?.name}</p>

            <form onSubmit={handleCreateUniformTypeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Uniform Category Name *</label>
                <input
                  type="text"
                  required
                  value={uniformName}
                  onChange={e => setUniformName(e.target.value)}
                  placeholder="e.g. Special Gala Uniform"
                  className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={uniformSlug}
                    onChange={e => setUniformSlug(e.target.value)}
                    placeholder="special-gala-uniform"
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={uniformOrder}
                    onChange={e => setUniformOrder(e.target.value)}
                    placeholder="4"
                    className="w-full text-xs font-bold px-3.5 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddUniformTypeModal(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
