import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  Headline,
  Paragraph,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  Dropdown,
  MultiSelectDropdown,
  DropdownInputProps,
  DropdownItemProps,
  DropdownRef,
} from 'react-native-paper-dropdown';

const OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const MULTI_SELECT_OPTIONS = [
  {
    label: 'White',
    value: 'white',
  },
  {
    label: 'Red',
    value: 'red',
  },
  {
    label: 'Blue',
    value: 'blue',
  },
  {
    label: 'Green',
    value: 'green',
  },
  {
    label: 'Orange',
    value: 'orange',
  },
];

const CustomDropdownItem = ({
  width,
  option,
  value,
  onSelect,
  toggleMenu,
  isLast,
  theme,
}) => {
  const style = useMemo(
    () => ({
      height: 50,
      width,
      backgroundColor:
        value === option.value
          ? theme.colors.primary
          : theme.colors.surface,
      justifyContent: 'center',
      paddingHorizontal: 16,
    }),
    [option.value, value, width, theme]
  );

  return (
    <>
      <TouchableRipple
        onPress={() => {
          onSelect?.(option.value);
          toggleMenu();
        }}
        style={style}
      >
        <Headline
          style={{
            color:
              value === option.value
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
          }}
        >
          {option.label}
        </Headline>
      </TouchableRipple>
      {!isLast && <Divider />}
    </>
  );
};

const CustomDropdownInput = ({
  placeholder,
  selectedLabel,
  rightIcon,
  theme,
}) => {
  return (
    <TextInput
      mode="outlined"
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      value={selectedLabel}
      style={{
        backgroundColor: theme.colors.surface,
      }}
      textColor={theme.colors.onSurface}
      right={rightIcon}
    />
  );
};

export default function BreakScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [gender, setGender] = useState();
  const [colors, setColors] = useState([]);
  const refDropdown1 = useRef(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Registrar Quebra" />
        <ThemeToggle />
      </Appbar.Header>
      <ScrollView
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps={'handled'}
      >
        <View style={styles.formWrapper}>
          <Paragraph>Selecione um Motivo</Paragraph>
          <Dropdown
            ref={refDropdown1}
            label={'Motivos'}
            placeholder="Selecione um Motivo"
            options={OPTIONS}
            value={gender}
            onSelect={setGender}
          />
          <View style={styles.spacer} />

          <TextInput
            label="Buscar Produtos"
            mode="outlined"
            placeholder=""
          />

          <View style={styles.spacer} />
          <TextInput
            label="Quantidade"
            mode="outlined"
            placeholder=""
          />
          <View style={styles.spacer} />
          <Button
            mode={'contained'}
            onPress={() => {
              setGender(undefined);
            }}
          >
            Salvar
          </Button>

          <View style={styles.spacer} />



        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formWrapper: {
    margin: 16,
  },
  spacer: {
    height: 16,
  },
});
