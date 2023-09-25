import {useEffect, useState} from 'react';

export default function Example({defaultValue}) {
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownDefault, setDropdownDefault] = useState('default');

  useEffect(() => {
    if (defaultValue !== null && defaultValue !== undefined) {
      setDropdownDefault(defaultValue);
      setIsLoading(false);
    }
  }, [defaultValue]);

  if (isLoading) return 'Some loading component skeleton';

  return (
    <NativeSelect
      defaultValue={dropdownDefault}
      inputProps={{
        name: 'age',
        id: 'uncontrolled-native'
      }}
    >
      <option value={10}>Ten</option>
      <option value={20}>Twenty</option>
      <option value={30}>Thirty</option>
    </NativeSelect>
  );
}
