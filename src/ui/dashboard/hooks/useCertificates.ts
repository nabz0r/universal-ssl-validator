import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchCertificates, validateCertificate } from '../store/slices/certificatesSlice';
import { AppDispatch } from '../store';

export const useCertificates = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.certificates
  );

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  const validateNew = async (domain: string) => {
    return dispatch(validateCertificate(domain)).unwrap();
  };

  const validCertificates = items.filter(cert => cert.status === 'valid');
  const warningCertificates = items.filter(cert => cert.status === 'warning');
  const expiredCertificates = items.filter(cert => cert.status === 'expired');

  return {
    certificates: items,
    validCertificates,
    warningCertificates,
    expiredCertificates,
    loading,
    error,
    validateNew
  };
};