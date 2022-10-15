import { dataBase, setData } from './dataStore';

export function clear(): Record<string, never> {
  const data: dataBase = {
    posts: [],
  };
  setData(data);

  return {};
}
