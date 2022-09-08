import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery'
import Button from './Button/Button'
import Loader from './Loader/Loader';

const URL = 'https://pixabay.com/api/';
const API_KEY = '29139026-1b7ca045c01626552c53cc26d';

export default function App() {
  const [pictures, setPictures] = useState([])
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalHits, setTotalHits] = useState(null);

  useEffect(() => {
    if (query === '') {
      return;
    }
    setStatus('pending');
    const fetchImg = () => {
      return fetch(
        `${URL}?q=${query}&page=${page}&key=${API_KEY}&image_type=photo&orientation=horizontal&per_page=12`
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          return Promise.reject(new Error('Failed to find any images'));
        })
        .then(pictures => {
          if (!pictures.total) {
            toast.error('Did find anything, mate');
          }
          return pictures;
        })
        .catch(error => setError(error) && setStatus('rejected'))
    };
    fetchImg().then(pictures => {
      const selectedProperties = pictures.hits.map(
            ({ id, largeImageURL, webformatURL }) => {
              return { id, largeImageURL, webformatURL };
            }
          );
          setPictures(prevState => [...prevState, ...selectedProperties]);
          setStatus('resolved');
      setTotalHits(pictures.total);
    })
  }, [page, query])
      
  const submitAction = query => {
    setQuery(query);
    setPage(1);
    setPictures([]);
  };
  const handleLoadMore = () => {
    setPage(prevState => prevState + 1);
  };
  return (
    <>
      <Searchbar onSubmit={submitAction} />
      {pictures.length && <ImageGallery images={pictures} />}
      {totalHits > pictures.length && <Button onClick={handleLoadMore} />}
      {status === 'pending' && <Loader />}
      {status === 'rejected' && { error }}
      <ToastContainer autoClose={2000} />
    </>
  );
}