import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      setError('');

      try {
        const resumeItems = (await kv.list('resume:*', true)) as KVItem[];

        if (!resumeItems || resumeItems.length === 0) {
          setResumes([]);
          setLoadingResumes(false);
          return;
        }

        const parsedResumes = resumeItems
          .map((resume) => {
            try {
              return JSON.parse(resume.value) as Resume;
            } catch (err) {
              console.error('Failed to parse resume:', resume.key, err);
              return null;
            }
          })
          .filter((resume): resume is Resume => resume !== null);

        // Sort by creation date (newest first)
        parsedResumes.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setResumes(parsedResumes);
      } catch (err) {
        console.error('Error loading resumes:', err);
        setError('Failed to load resumes. Please try refreshing the page.');
      } finally {
        setLoadingResumes(false);
      }
    }

    if (auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Loading resumes" />
            <p className="mt-4 text-gray-600">Loading your resumes...</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <div className="text-center mb-4">
              <img src="/images/resume-scan-2.gif" className="w-[150px] mx-auto opacity-50" alt="No resumes" />
              <p className="text-gray-500 mt-4">Ready to get started?</p>
            </div>
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Your First Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}