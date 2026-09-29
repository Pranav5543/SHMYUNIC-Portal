'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, School, Company, Product, Child } from '../types';
import { fetchCart, addToCartApi, removeFromCartApi, clearCartApi, loginUser as loginApi, registerUser as registerApi, fetchChildren, fetchSchools, fetchCurrentUser } from '../services/api';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string | null;
  companyId?: string | null;
  vendorId?: string | null;
  isEmailVerified?: boolean;
}

export interface CartItemEntry {
  id?: string;
  productId: string;
  productName: string;
  selectedSize: string;
  quantity: number;
  priceSnapshot: number;
  image: string;
  product?: Product;
}

interface AppContextType {
  user: UserSession | null;
  token: string | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSchool: School | null;
  setActiveSchool: (school: School) => void;
  activeCompany: Company | null;
  setActiveCompany: (company: Company) => void;
  childrenList: Child[];
  activeChild: Child | null;
  setActiveChild: (child: Child) => void;
  loadUserChildren: () => Promise<void>;
  cart: CartItemEntry[];
  addToCart: (product: Product, selectedSize: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (itemId: string, productId?: string, selectedSize?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  login: (email: string, password: string, targetRole: UserRole) => Promise<any>;
  register: (payload: any) => Promise<any>;
  setAuthSession: (authToken: string, userSession: UserSession) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUserStr = localStorage.getItem('smu_user');
      if (storedUserStr) {
        try {
          return JSON.parse(storedUserStr);
        } catch {}
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smu_token');
    }
    return null;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    if (user?.role) return user.role;
    return 'STUDENT_PARENT';
  });
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [cart, setCart] = useState<CartItemEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUserChildren = async () => {
    try {
      const res = await fetchChildren();
      if (res.children && res.children.length > 0) {
        setChildrenList(res.children);
        // Automatically select first child if none active
        if (!activeChild) {
          const first = res.children[0];
          setActiveChildState(first);
          if (first.school) {
            setActiveSchool(first.school);
          } else if (first.schoolId) {
            fetchSchools().then(sRes => {
              const s = sRes.schools?.find((sch: School) => sch.id === first.schoolId);
              if (s) setActiveSchool(s);
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load user children:', e);
    }
  };

  const setActiveChild = (child: Child) => {
    setActiveChildState(child);
    if (child.school) {
      setActiveSchool(child.school);
    } else if (child.schoolId) {
      fetchSchools().then(sRes => {
        const s = sRes.schools?.find((sch: School) => sch.id === child.schoolId);
        if (s) setActiveSchool(s);
      });
    }
    showToast(`Shopping context switched to child: ${child.name}`);
  };

  // Load & verify session with backend /api/auth/me on mount + handle direct OAuth portal returns
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('token');
      const oauthUserStr = urlParams.get('user');

      if (oauthToken && oauthUserStr) {
        try {
          const parsedUser: UserSession = JSON.parse(oauthUserStr);
          setToken(oauthToken);
          setUser(parsedUser);
          setRoleState(parsedUser.role);
          localStorage.setItem('smu_token', oauthToken);
          localStorage.setItem('smu_user', JSON.stringify(parsedUser));
          loadBackendCart(oauthToken);
          if (parsedUser.role === 'STUDENT_PARENT') {
            loadUserChildren();
          }
          showToast(`Welcome ${parsedUser.firstName || 'User'}! Authenticated via Google.`);
          // Clean URL params without page reload
          window.history.replaceState({}, '', window.location.pathname);
          return;
        } catch (e) {
          console.error('Failed to parse OAuth return params in AppContext:', e);
        }
      }

      const storedToken = localStorage.getItem('smu_token');
      if (storedToken) {
        setToken(storedToken);
        fetchCurrentUser(storedToken)
          .then(res => {
            if (res.user) {
              setUser(res.user);
              setRoleState(res.user.role);
              localStorage.setItem('smu_user', JSON.stringify(res.user));
              loadBackendCart(storedToken);
              if (res.user.role === 'STUDENT_PARENT') {
                loadUserChildren();
              }
            } else {
              setToken(null);
              setUser(null);
              localStorage.removeItem('smu_token');
              localStorage.removeItem('smu_user');
            }
          })
          .catch(() => {
            const storedUserStr = localStorage.getItem('smu_user');
            if (storedUserStr) {
              try {
                const u = JSON.parse(storedUserStr);
                setUser(u);
                setRoleState(u.role);
              } catch {}
            }
          });
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBackendCart = async (authToken?: string) => {
    try {
      const data = await fetchCart();
      if (data.items) {
        setCart(data.items);
      }
    } catch (e) {
      console.error('Failed to load cart from backend:', e);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      showToast(`Role switched to: ${newRole.replace('_', ' ')}`);
    }
  };

  const login = async (email: string, password: string, targetRole: UserRole) => {
    const res = await loginApi(email, password, targetRole);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setRoleState(res.user.role);
      localStorage.setItem('smu_token', res.token);
      localStorage.setItem('smu_user', JSON.stringify(res.user));
      showToast(`Welcome back, ${res.user.firstName}!`);

      await loadBackendCart(res.token);

      if (res.user.role === 'STUDENT_PARENT') {
        await loadUserChildren();
      }

      if (typeof window !== 'undefined') {
        const pendingItemStr = sessionStorage.getItem('pending_cart_item');
        if (pendingItemStr) {
          try {
            const pending = JSON.parse(pendingItemStr);
            sessionStorage.removeItem('pending_cart_item');
            await addToCartApi(pending.productId, pending.selectedSize, pending.quantity);
            await loadBackendCart(res.token);
            showToast(`Added ${pending.productName} (Size ${pending.selectedSize}) to your cart!`);
          } catch (err) {
            console.error('Failed to restore pending cart item:', err);
          }
        }
      }
    }
    return res;
  };

  const register = async (payload: any) => {
    const res = await registerApi(payload);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setRoleState(res.user.role);
      localStorage.setItem('smu_token', res.token);
      localStorage.setItem('smu_user', JSON.stringify(res.user));
      showToast(`Account registered successfully! Welcome, ${res.user.firstName}.`);
      if (res.user.role === 'STUDENT_PARENT') {
        await loadUserChildren();
      }
    }
    return res;
  };

  const setAuthSession = (authToken: string, userSession: UserSession) => {
    setToken(authToken);
    setUser(userSession);
    setRoleState(userSession.role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smu_token', authToken);
      localStorage.setItem('smu_user', JSON.stringify(userSession));
    }
    loadBackendCart(authToken);
    if (userSession.role === 'STUDENT_PARENT') {
      loadUserChildren();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    setChildrenList([]);
    setActiveChildState(null);
    setActiveSchool(null);
    setActiveCompany(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smu_token');
      localStorage.removeItem('smu_user');
    }
    showToast('Signed out successfully.');
    router.push('/');
  };

  const addToCart = async (product: Product, selectedSize: string, quantity = 1): Promise<boolean> => {
    if (!token || !user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_item', JSON.stringify({
          productId: product.id,
          productName: product.name,
          selectedSize,
          quantity
        }));
      }
      showToast('Please sign in to add items to your cart.');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return false;
    }

    try {
      const res = await addToCartApi(product.id, selectedSize, quantity);
      if (res.items) {
        setCart(res.items);
        showToast(res.message || `Added ${product.name} (Size ${selectedSize}) to cart`);
        return true;
      } else if (res.error) {
        showToast(`Cart Error: ${res.error}`);
        return false;
      }
    } catch (e: any) {
      showToast(`Failed to add item to cart: ${e.message}`);
      return false;
    }

    return true;
  };

  const removeFromCart = async (itemId: string) => {
    if (!token) return;
    try {
      await removeFromCartApi(itemId);
      setCart(prev => prev.filter(i => i.id !== itemId));
      showToast('Item removed from cart');
    } catch (e) {
      console.error('Failed to remove cart item:', e);
    }
  };

  const clearCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      await clearCartApi();
      setCart([]);
      showToast('Cart cleared');
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  };

  const refreshCart = async () => {
    if (token) {
      await loadBackendCart(token);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        role,
        setRole,
        activeSchool,
        setActiveSchool,
        activeCompany,
        setActiveCompany,
        childrenList,
        activeChild,
        setActiveChild,
        loadUserChildren,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
        cartCount,
        subtotal,
        toastMessage,
        showToast,
        login,
        register,
        setAuthSession,
        logout
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#102a43] text-white px-5 py-3 rounded-xl shadow-2xl z-50 text-xs font-semibold flex items-center gap-2 border border-[#FF561F]/40 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#FF561F]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
