import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Brain, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import { uploadReport, type WellnessPlan } from '../services/reportService';

const ReportUpload = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setAnalyzing(true);
    setError(null);

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString().split(',')[1];
          resolve(base64 || '');
        };
        reader.readAsDataURL(file);
      });

      // Call Firebase Function
      const result = await uploadReport(fileData, file.name, file.type);
      
      if (result.success && result.wellnessPlan) {
        setWellnessPlan(result.wellnessPlan);
        console.log('✅ Report processed successfully:', {
          fileName: result.fileName,
          processingTime: result.processingTime,
          extractedFields: Object.keys(result.extractedData || {}).length
        });
      } else {
        console.error('❌ Report processing failed:', {
          step: result.step,
          error: result.error,
          details: result.details
        });
        
        // User-friendly error messages based on step
        let userMessage = 'Failed to process report. Please try again.';
        
        switch (result.step) {
          case 'validation':
            userMessage = 'Invalid file format. Please upload a PDF or image file.';
            break;
          case 'storage':
            userMessage = 'Failed to upload file. Please check your connection and try again.';
            break;
          case 'ai_generation':
            userMessage = 'Could not generate wellness plan. Please try uploading a clearer medical report.';
            break;
          default:
            userMessage = result.error || 'An unexpected error occurred. Please try again.';
        }
        
        throw new Error(userMessage);
      }
    } catch (err) {
      setError('Failed to process report. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const WellnessCard = ({ title, items, icon: Icon, gradient }: {
    title: string;
    items: string[];
    icon: any;
    gradient: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className={`h-full ${gradient} border-0 shadow-lg backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Report Upload" />

        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-[70px]'
          }`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-b border-gray-200/50 bg-white/70 backdrop-blur-sm"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-1">AI Wellness Plan Generator</h1>
              <p className="text-gray-600">Upload your medical report to get a personalized wellness plan</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6">

        {!wellnessPlan ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Medical Report</h3>
                    <p className="text-gray-600">Supported formats: PDF, JPG, PNG</p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Click to select file or drag and drop</p>
                      </div>
                    </label>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{file.name}</span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 text-lg disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {analyzing ? 'Generating AI Wellness Plan...' : 'Uploading...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Generate Wellness Plan
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">Your Personalized Wellness Plan</h2>
              <p className="text-gray-600">Based on your medical report analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WellnessCard
                title="Diet Recommendations"
                items={wellnessPlan.diet}
                icon={FileText}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <WellnessCard
                title="Exercise Routine"
                items={wellnessPlan.exercise}
                icon={FileText}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              />
              <WellnessCard
                title="Sleep Tips"
                items={wellnessPlan.sleep}
                icon={FileText}
                gradient="bg-gradient-to-br from-purple-500 to-violet-600"
              />
              <WellnessCard
                title="Local Food Tips"
                items={wellnessPlan.localFoods}
                icon={FileText}
                gradient="bg-gradient-to-br from-orange-500 to-red-600"
              />
            </div>

            <div className="text-center">
              <Button
                onClick={() => {
                  setFile(null);
                  setWellnessPlan(null);
                  setError(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                Upload Another Report
              </Button>
            </div>
          </motion.div>
        )}
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <motion.button 
          onClick={() => navigate('/crisis-helpline')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all duration-200"
        >
          <Phone className="w-7 h-7 group-hover:animate-pulse" />
        </motion.button>
        <div className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Crisis Support
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportUpload;