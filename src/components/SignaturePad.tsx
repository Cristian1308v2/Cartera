import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  let signaturePad: SignatureCanvas | null = null;

  const clear = () => {
    signaturePad?.clear();
  };

  const save = () => {
    if (signaturePad) {
      const signatureData = signaturePad.toDataURL();
      onSave(signatureData);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <SignatureCanvas
        ref={(ref) => {
          signaturePad = ref;
        }}
        canvasProps={{
          className: 'signature-canvas border rounded w-full h-40',
        }}
      />
      <div className="flex gap-4 mt-4">
        <button
          onClick={clear}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={save}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;