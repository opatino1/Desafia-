
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import Editor from './components/Editor';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (base64Image: string) => {
    setImage(base64Image);
  };

  return (
    <div className="w-full h-screen">
      {!image ? (
        <ImageUploader onImageUpload={handleImageUpload} />
      ) : (
        <Editor initialImage={image} />
      )}
    </div>
  );
};

export default App;
