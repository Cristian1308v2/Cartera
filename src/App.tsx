import React, { useState } from 'react';
import { FileText, Send, UserCheck, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import emailjs from 'emailjs-com';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import FormInput from './components/FormInput';
import SignaturePad from './components/SignaturePad';
import { emailConfig } from './config';
import { splitDataUri, compressImage } from './utils/pdfUtils';

interface FormData {
  name: string;
  email: string;
  address: string;
  identification: string;
  signature: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    identification: '',
    signature: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignatureSave = (signatureData: string) => {
    setFormData({
      ...formData,
      signature: signatureData,
    });
    toast.success('Signature saved successfully!');
  };

  const validateForm = (): boolean => {
    if (!formData.signature) {
      toast.error('Please add your signature before submitting');
      return false;
    }

    if (!formData.name || !formData.email || !formData.address || !formData.identification) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const generatePDF = async (): Promise<string | null> => {
    const formElement = document.getElementById('form-container');
    if (!formElement) {
      toast.error('Form container not found');
      return null;
    }

    try {
      const canvas = await html2canvas(formElement);
      const compressedImage = await compressImage(canvas.toDataURL('image/jpeg', 0.7));
      
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(compressedImage);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(compressedImage, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
      return null;
    }
  };

  const sendEmail = async (pdfDataUri: string): Promise<boolean> => {
  try {
    emailjs.init(emailConfig.userId);

    // Split and encode the data URI to a base64 format
    const pdfBase64 = pdfDataUri.split(',')[1]; // Strip the "data:application/pdf;base64," prefix

    const templateParams = {
      to_email: formData.email,
      from_name: "Your Company",
      message: "Thank you for submitting your form. Please find your PDF attached.",
      user_name: formData.name,
      attachment: pdfBase64, // Pass the base64-encoded string
    };

    await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    toast.error('Failed to send email. Please try again.');
    return false;
  }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const pdfDataUri = await generatePDF();
      if (!pdfDataUri) {
        return;
      }

      const emailSent = await sendEmail(pdfDataUri);
      
      if (emailSent) {
        toast.success('Form submitted and PDF sent successfully!');
        setFormData({
          name: '',
          email: '',
          address: '',
          identification: '',
          signature: '',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Submission Form
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to generate your personalized document
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8" id="form-container">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <UserCheck className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>
                
                <FormInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
                
                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Additional Details
                  </h2>
                </div>
                
                <FormInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, Country"
                />
                
                <FormInput
                  label="Identification Number"
                  name="identification"
                  value={formData.identification}
                  onChange={handleInputChange}
                  placeholder="ID-12345678"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Digital Signature
              </h3>
              <SignaturePad onSave={handleSignatureSave} />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? 'Processing...' : 'Submit and Generate PDF'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;