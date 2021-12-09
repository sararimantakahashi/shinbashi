import { useState, useEffect } from "react";

const useSessionStorage = function (name:string, defaultValue:any) :any {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const val = sessionStorage.getItem(name);
    if (val) {
      setValue(JSON.parse(val as string));
    }
  }, [])

  const setter = (value:any) => {
    const str = JSON.stringify(value);
    sessionStorage.setItem(name, str);
    setValue(value);
  }

  return [value, setter];
}

export default useSessionStorage
