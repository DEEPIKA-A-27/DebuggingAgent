import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { historyAPI } from '../services/authService';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getById(id)
      .then(({ data }) => {
        const row = data.data;
        // Transform DB field names to frontend format
        navigate('/analysis', {
          state: {
            result: {
              historyId: row.id,
              originalCode: row.original_code,
              language: row.language,
              syntaxErrors: row.syntax_errors,
              logicalErrors: row.logical_errors,
              correctedCode: row.corrected_code,
              optimizedCode: row.optimized_code,
              optimizationExplanation: row.optimization_explanation,
              testCases: row.generated_test_cases,
              boundaryTestCases: row.boundary_test_cases,
              edgeTestCases: row.edge_test_cases,
              expectedOutputs: row.expected_outputs,
              bestPractices: row.best_practices,
              timeComplexity: row.time_complexity,
              spaceComplexity: row.space_complexity,
              learningTopics: row.learning_topics,
            },
          },
          replace: true,
        });
      })
      .catch(() => {
        toast.error('History record not found');
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Loading report..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Record not found.</p>
        <Link to="/history" className="btn-primary flex items-center gap-2 mx-auto w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    </DashboardLayout>
  );
}
