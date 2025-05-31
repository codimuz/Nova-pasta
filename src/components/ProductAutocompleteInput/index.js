import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import useProductSearch from './hooks/useProductSearch';
import HighlightedText from './components/HighlightedText';
import { styles } from './styles';
import { theme } from '../../theme';

const ProductAutocompleteInput = ({
  onProductSelect,
  onCodeChange,
  placeholder = "Digite o código do produto",
  minChars = 3,
  maxSuggestions = 5,
  debounceMs = 300,
  showClearButton = true,
  autoFocus = false,
  style,
  inputStyle,
  suggestionsStyle,
  value: externalValue,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    code,
    selectedProduct,
    filteredProducts,
    isSearching,
    showSuggestions,
    searchError,
    noProductsFound,
    handleCodeChange,
    selectProduct,
    clearSearch,
    handleFocus,
    handleBlur,
    minimumCharsReached,
    hasResults,
    shouldShowMessage,
  } = useProductSearch(onProductSelect, {
    minChars,
    debounceMs,
    maxSuggestions,
  });

  // Usar valor externo se fornecido (modo controlado)
  const inputValue = externalValue !== undefined ? externalValue : code;

  // Animação das sugestões
  React.useEffect(() => {
    if (showSuggestions) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestions, fadeAnim]);

  const handleInputChange = (text) => {
    handleCodeChange(text);
    if (onCodeChange) {
      onCodeChange(text);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    handleFocus();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay maior para garantir que a seleção funcione antes de ocultar
    setTimeout(() => {
      handleBlur();
    }, 200);
  };

  const handleClearPress = () => {
    clearSearch();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderSuggestionItem = (item, index) => {
    const isLast = index === filteredProducts.length - 1;
    
    return (
      <TouchableOpacity
        key={item.product_code}
        style={[
          styles.suggestionItem,
          isLast && styles.suggestionItemLast,
        ]}
        onPress={() => selectProduct(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Selecionar produto ${item.product_name}, código ${item.product_code}`}
      >
        <HighlightedText
          text={item.product_name}
          searchTerm={inputValue}
          style={styles.suggestionName}
        />
        <Text style={styles.suggestionCode}>({item.product_code})</Text>
      </TouchableOpacity>
    );
  };

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Buscando produtos...</Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.messageContainer}>
      <Text style={styles.noResultsText}>
        Nenhum produto encontrado para "{inputValue}"
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.messageContainer}>
      <Text style={styles.errorText}>
        {searchError}
      </Text>
    </View>
  );

  const renderMinCharsMessage = () => (
    <View style={styles.messageContainer}>
      <Text style={styles.minCharsText}>
        Digite pelo menos {minChars} caracteres para buscar
      </Text>
    </View>
  );

  const renderSuggestionsContent = () => {
    if (isSearching) {
      return renderLoadingIndicator();
    }

    if (searchError) {
      return renderError();
    }

    if (!minimumCharsReached && inputValue.trim().length > 0) {
      return renderMinCharsMessage();
    }

    if (noProductsFound && minimumCharsReached) {
      return renderNoResults();
    }

    if (hasResults) {
      return (
        <ScrollView
          style={styles.suggestionsList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.map((item, index) => renderSuggestionItem(item, index))}
        </ScrollView>
      );
    }

    return null;
  };

  const shouldShowSuggestions = showSuggestions && (
    isSearching ||
    hasResults ||
    shouldShowMessage ||
    (!minimumCharsReached && inputValue.trim().length > 0)
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            isFocused && styles.textInputFocused,
            searchError && styles.textInputError,
            inputStyle,
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Campo de código do produto"
          accessibilityHint="Digite o código para buscar produtos"
          {...props}
        />

        {/* Botão de limpar */}
        {showClearButton && inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Limpar campo"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de sugestões */}
      {shouldShowSuggestions && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            { opacity: fadeAnim },
            suggestionsStyle,
          ]}
          accessibilityRole="list"
          accessibilityLabel="Lista de sugestões de produtos"
        >
          {renderSuggestionsContent()}
        </Animated.View>
      )}
    </View>
  );
};

ProductAutocompleteInput.propTypes = {
  onProductSelect: PropTypes.func.isRequired,
  onCodeChange: PropTypes.func,
  placeholder: PropTypes.string,
  minChars: PropTypes.number,
  maxSuggestions: PropTypes.number,
  debounceMs: PropTypes.number,
  showClearButton: PropTypes.bool,
  autoFocus: PropTypes.bool,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  suggestionsStyle: PropTypes.object,
  value: PropTypes.string,
};

export default ProductAutocompleteInput;
