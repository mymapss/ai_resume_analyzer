import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import Navbar from '~/components/Navbar';
import { generateUUID } from '~/lib/utils';

export const meta = () => ([
    { title: 'Resumind | Create Class' },
    { name: 'description', content: 'Create a new class for resume reviews' },
]);

const CreateClass = () => {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreating(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const className = formData.get('class-name') as string;
        const description = formData.get('description') as string;

        const classId = generateUUID();
        const classData = {
            id: classId,
            name: className,
            description,
            createdAt: new Date().toISOString(),
            students: [],
        };

        await kv.set(`class:${classId}`, JSON.stringify(classData));
        
        setIsCreating(false);
        navigate(`/classes/${classId}`);
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Create New Class</h1>
                    <h2>Set up a new class for managing resume reviews</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        <div className="form-div">
                            <label htmlFor="class-name">Class Name</label>
                            <input
                                type="text"
                                name="class-name"
                                placeholder="e.g., CS 101 - Spring 2024"
                                id="class-name"
                                required
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="description">Description</label>
                            <textarea
                                rows={3}
                                name="description"
                                placeholder="Brief description of the class"
                                id="description"
                            />
                        </div>

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Class'}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default CreateClass;