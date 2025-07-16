import React, { useState, useCallback } from 'react';

const useFetch = () => {
  const [data, setData] = useState(null);
  const [loader, setLoader] = useState(false);
  const [status, setStatus] = useState({
    ok: '',
    message: '',
  });

  const fetchRequest = useCallback(async (url, options) => {
    try {
      setStatus({
        ok: '',
        message: '',
      });
      setLoader(true);
      const response = await fetch(url, options);
      const json = await response.json();
      setData(json);
      console.log(json, response);
      if (response.ok === true) {
        setStatus({ ok: true, message: 'Sucesso' });
      } else {
        setStatus({ ok: false, message: 'Erro na validação' });
      }
    } catch (err) {
      setStatus({
        ok: false,
        message: 'Erro na requisição API ' + err.message,
      });
    } finally {
      setLoader(false);
    }
  }, []);
  return { data, loader, status, fetchRequest };
};

export default useFetch;
