import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

const PageTitle = ({ title, description }) => {
  const fullTitle = title ? `${title} - CodeChat` : 'CodeChat - Code Together, Learn Together';
  const defaultDescription = 'Real-time collaboration platform for developers to code, chat, and learn together';

  // Force document.title update as fallback
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
};

export default PageTitle;