import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductsContext = createContext({
  products: [],
  loading: false,
  error: null,
  refreshProducts: () => {},
});

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children, options = {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Aqui você pode implementar a lógica para buscar produtos
      // Por enquanto, vamos usar dados mock
      const mockProducts = [
        { id: 1, name: 'Produto 1', sku: 'SKU001' },
        { id: 2, name: 'Produto 2', sku: 'SKU002' },
      ];
      setProducts(mockProducts);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.initialLoad) {
      refreshProducts();
    }
  }, []);

  const value = {
    products,
    loading,
    error,
    refreshProducts,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
