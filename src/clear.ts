import { dataBase, setData } from './dataStore'

export function clear(): {} {
    const data: dataBase = {
        posts: [],
    }
    setData(data);
    
    return {}
}