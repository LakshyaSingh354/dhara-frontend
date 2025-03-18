"use client";

import { PlaceholdersAndInputSearch } from "@/ui-components/search-bar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCloudUploadAlt } from "react-icons/fa"; // Import the upload icon
import ReactMarkdown from "react-markdown"; // Import react-markdown for rendering markdown
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"; // Import your text generation effect

export default function SearchPage() {
	const [apiResponse, setApiResponse] = useState(""); // State for API response
	const [query, setQuery] = useState(""); // State for input query
	const [loading, setLoading] = useState(false); // State for loading
	const [file, setFile] = useState<File | null>(null); // State for file

	const placeholders = [
		"Breach of contract due to force majeure in the textile industry",
		"Intellectual property infringement in software development",
		"Shareholder disputes in a family-owned company",
		"Arbitration clause enforcement in international commercial contracts",
		"Damages calculation in a construction delay case",
	];

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value); // Update query state
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files; // Get the selected files
		if (selectedFiles && selectedFiles.length > 0) {
			setLoading(true); // Show loading indicator

			const formData = new FormData();
			for (let i = 0; i < selectedFiles.length; i++) {
				formData.append("files", selectedFiles[i]); // Append each file with the key 'files'
			}

			try {
				const response = await fetch(
					"https://dhara-model-92062613767.us-central1.run.app/upload-files",
					{
						method: "POST",
						body: formData, // Send the files to the backend
					}
				);

				if (!response.ok) {
					throw new Error("Failed to upload files");
				}

				const data = await response.json();
				console.log("Files uploaded successfully:", data);
			} catch (error) {
				console.error("Error uploading files:", error);
			} finally {
				setLoading(false); // Hide loading indicator
			}
		}
	};

	const router = useRouter(); // Initialize the router

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true); // Start loading

		try {
			console.log("query", query);
			const response = await fetch("https://dhara-model-92062613767.us-central1.run.app/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ question: query }), // Send the query state in the request
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const data = await response.json();
			setApiResponse(data.response); // Set the response in state

			// Log the response
			console.log("API response:", data.response);
		} catch (error) {
			console.error("Error fetching the API:", error);
		} finally {
			setLoading(false); // Stop loading
		}
	};

	return (
		<div>
			<div className="flex px-64 items-center justify-center h-auto w-screen mt-[8rem] z-200">
				<PlaceholdersAndInputSearch
					placeholders={placeholders}
					onChange={handleChange}
					onSubmit={onSubmit}
				/>
			</div>

			{/* File upload button */}
			<div className="flex justify-center items-center mt-6">
				<label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-blue-600 transition duration-300">
					<FaCloudUploadAlt size={24} />
					<span className="text-sm">Upload Files</span>
					<input
						type="file"
						className="hidden"
						onChange={handleFileUpload} // Handle file upload logic
						multiple // Allow selecting multiple files
					/>
				</label>

				{/* Display selected file name */}
				{file && (
					<span className="ml-4 text-lg text-gray-700">
						{file.name}
					</span>
				)}
			</div>

			<div className="mt-6 text-white px-20 items-center justify-center">
				{loading ? (
					<div className="flex justify-center items-center">
						{/* Stylish loader */}
						<div className="animate-spin h-12 w-12 border-t-4 border-blue-500 border-solid rounded-full"></div>
					</div>
				) : (
					apiResponse && (
						<div className="relative z-20 font-sans font-bol text-neutral-700 dark:text-neutral-300 text-base">
							<strong>Response:</strong>

							{/* Apply TextGenerateEffect to the response text */}
							<div className="markdown-content space-y-4 text-2xl">
								{/* Render the markdown response */}
								{/* <TextGenerateEffect words={apiResponse}> */}
								<ReactMarkdown>{apiResponse}</ReactMarkdown>
								{/* </TextGenerateEffect> */}
							</div>
						</div>
					)
				)}
			</div>
		</div>
	);
}
