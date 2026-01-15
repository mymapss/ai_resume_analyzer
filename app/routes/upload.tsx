import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    setError("");
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setError("");

    try {
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        throw new Error("Failed to upload file");
      }
      console.log("File uploaded:", uploadedFile);

      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        throw new Error("Failed to convert PDF to image");
      }
      console.log("Image converted");

      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        throw new Error("Failed to upload image");
      }
      console.log("Image uploaded:", uploadedImage);

      setStatusText("Preparing data...");
      const uuid = generateUUID();

      setStatusText("Analyzing resume with AI... This may take 30-60 seconds.");

      console.log(
        "Sending to AI with instructions:",
        prepareInstructions({ jobTitle, jobDescription })
      );

      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({ jobTitle, jobDescription })
      );

      console.log("AI Response received:", feedback);
      console.log("AI Response type:", typeof feedback);
      console.log(
        "AI Response keys:",
        feedback ? Object.keys(feedback) : "null"
      );

      if (!feedback) {
        throw new Error("Failed to analyze resume - no response from AI");
      }

      console.log("Feedback object structure:", {
        hasMessage: "message" in feedback,
        hasContent: feedback.message ? "content" in feedback.message : false,
        messageType: typeof feedback.message,
        contentType: feedback.message ? typeof feedback.message.content : "N/A",
      });

      if (!feedback.message || !feedback.message.content) {
        console.error(
          "Invalid feedback structure:",
          JSON.stringify(feedback, null, 2)
        );
        throw new Error("Invalid response structure from AI");
      }

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;

      console.log("Feedback text received:", feedbackText);

      // Extract JSON from markdown code blocks if present
      let cleanedText = feedbackText.trim();

      // Remove markdown code blocks
      if (cleanedText.includes("```json")) {
        const match = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          cleanedText = match[1].trim();
        }
      } else if (cleanedText.includes("```")) {
        const match = cleanedText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) {
          cleanedText = match[1].trim();
        }
      }

      // Check if response looks like JSON after cleaning
      if (!cleanedText.startsWith("{") && !cleanedText.startsWith("[")) {
        console.error(
          "Response does not appear to be JSON after cleaning:",
          cleanedText
        );
        throw new Error("AI response is not in JSON format. Please try again.");
      }

      let parsedFeedback;
      try {
        parsedFeedback = JSON.parse(cleanedText);
        console.log("Successfully parsed feedback:", parsedFeedback);
      } catch (parseError) {
        console.error("Failed to parse feedback as JSON:", feedbackText);
        console.error("Parse error:", parseError);
        throw new Error(
          "Failed to parse AI response as JSON. The AI may not have returned the data in the correct format."
        );
      }

      // Validate that feedback has required structure
      const requiredFields = [
        "overallScore",
        "ATS",
        "toneAndStyle",
        "content",
        "structure",
        "skills",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in parsedFeedback)
      );

      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        console.error(
          "Received feedback structure:",
          Object.keys(parsedFeedback)
        );
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`
        );
      }

      if (typeof parsedFeedback.overallScore !== "number") {
        console.error("Invalid overallScore:", parsedFeedback.overallScore);
        throw new Error(
          'AI response has invalid "overallScore" (must be a number)'
        );
      }

      if (!parsedFeedback.ATS || typeof parsedFeedback.ATS.score !== "number") {
        console.error("Invalid ATS structure:", parsedFeedback.ATS);
        throw new Error('AI response missing or invalid "ATS.score" field');
      }

      // Validate that each section has the required structure
      const sections = [
        "ATS",
        "toneAndStyle",
        "content",
        "structure",
        "skills",
      ];
      for (const section of sections) {
        if (
          !parsedFeedback[section] ||
          typeof parsedFeedback[section].score !== "number"
        ) {
          throw new Error(
            `Invalid ${section} section: missing or invalid score`
          );
        }
        if (!Array.isArray(parsedFeedback[section].tips)) {
          throw new Error(`Invalid ${section} section: tips must be an array`);
        }
      }

      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: parsedFeedback,
        createdAt: new Date().toISOString(),
      };

      setStatusText("Saving analysis...");
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      console.log("Data saved successfully:", data);

      setStatusText("Analysis complete! Redirecting...");

      // Small delay to show success message
      setTimeout(() => {
        navigate(`/resume/${uuid}`);
      }, 800);
    } catch (err) {
      console.error("Error during analysis:", err);
      console.error("Error type:", typeof err);
      console.error("Error constructor:", err?.constructor?.name);

      // Log all error properties
      if (err && typeof err === "object") {
        console.error("Error keys:", Object.keys(err));
        console.error("Error values:", Object.values(err));
        console.error("Full error object:", JSON.stringify(err, null, 2));
      }

      // Provide more specific error messages
      let errorMessage = "An unknown error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;
        console.error("Error stack:", err.stack);
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err && typeof err === "object") {
        // Try to extract meaningful error info
        if ("message" in err) {
          errorMessage = String(err.message);
        } else if ("error" in err) {
          errorMessage = String(err.error);
        } else if ("info" in err) {
          errorMessage = String(err.info);
        } else {
          errorMessage = JSON.stringify(err, null, 2);
        }
      }

      setError(errorMessage);
      setStatusText("");
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    // Basic validation
    if (!companyName?.trim() || !jobTitle?.trim() || !jobDescription?.trim()) {
      setError("Please fill in all fields");
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2 className="text-blue-600 animate-pulse">{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                className="w-full"
                alt="Analyzing resume"
              />
              <p className="text-sm text-gray-600 mt-4">
                This process may take up to a minute. Please don't close this
                page.
              </p>
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              <strong>Error: </strong>
              {error}
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline">
                  Show technical details
                </summary>
                <pre className="text-xs mt-2 overflow-auto max-h-40 bg-red-50 p-2 rounded">
                  Check the browser console (F12) for detailed logs
                </pre>
              </details>
            </div>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  id="company-name"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="e.g., Software Engineer, Product Manager"
                  id="job-title"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Paste the full job description here..."
                  id="job-description"
                  required
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume (PDF)</label>
                <FileUploader onFileSelect={handleFileSelect} />
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {file.name} selected
                  </p>
                )}
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={isProcessing || !file}
              >
                {isProcessing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;
