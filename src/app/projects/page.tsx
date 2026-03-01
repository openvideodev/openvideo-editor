"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { storageService } from "@/lib/storage/storage-service";
import { TProject } from "@/types/project";
import { generateUUID } from "@/utils/id";
import { Button } from "@/components/ui/button";
import { Plus, Video, Search, Trash2, MoreHorizontal, X, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Project Card ────────────────────────────────────────────────────────────

interface ProjectCardProps {
    project: TProject;
    onOpen: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            onClick={() => onOpen(project.id)}
            className="group flex flex-col gap-2.5 cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-2xl bg-muted/30 border border-border/30 overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-black/10 group-hover:border-border/60">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-muted-foreground/20" strokeWidth={1.5} />
                    </div>
                )}

                {/* Hover overlay with actions */}
                <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div ref={menuRef} className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-border/60 bg-popover shadow-xl py-1 text-sm">
                                <button
                                    onClick={(e) => { setMenuOpen(false); onDelete(e, project.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="px-0.5">
                <p className="text-sm font-medium truncate leading-snug">{project.name}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{formattedDate}</p>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const [projects, setProjects] = useState<TProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const loaded = await storageService.loadAllProjects();
            setProjects(loaded);
        } catch (e) {
            console.error("Failed to load projects", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        const sceneId = generateUUID();
        const newProject: TProject = {
            id: generateUUID(),
            name: "Untitled project",
            thumbnail: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            scenes: [
                {
                    id: sceneId,
                    name: "Main Scene",
                    isMain: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            currentSceneId: sceneId,
            canvasSize: { width: 1080, height: 1920 },
            canvasMode: "preset",
            fps: 30,
        };

        try {
            await storageService.saveProject({ project: newProject });
            router.push(`/edit/${newProject.id}`);
        } catch (e) {
            console.error("Failed to create project", e);
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await storageService.deleteProject({ id });
            await loadProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    };

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 border-b border-border/80 px-6 h-14 shrink-0">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => router.push("/")} className="cursor-pointer">
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="">Projects</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects…"
                            className="h-8 pl-7 pr-7 text-xs w-44 bg-muted/30 border-border/30 rounded-lg placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:border-border/60"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <Button onClick={handleCreateProject} size="sm" className="h-8 text-xs gap-1.5 px-3 rounded-full">
                        <Plus className="w-3.5 h-3.5" />
                        New project
                    </Button>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 px-6 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-5 h-5 border-2 border-muted border-t-foreground/40 rounded-full animate-spin" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground mt-8 text-base space-y-2">
                        <div className="py-2 text-stone-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M2.07 5.258C2 5.626 2 6.068 2 6.95v2.3h19.953c-.072-1.049-.256-1.737-.723-2.256a3 3 0 0 0-.224-.225C20.151 6 18.834 6 16.202 6h-.374c-1.153 0-1.73 0-2.268-.153a4 4 0 0 1-.848-.352C12.224 5.224 11.816 4.815 11 4l-.55-.55c-.274-.274-.41-.41-.554-.53a4 4 0 0 0-2.18-.903C7.53 2 7.336 2 6.95 2c-.883 0-1.324 0-1.692.07A4 4 0 0 0 2.07 5.257m19.928 5.492H2V14c0 3.771 0 5.657 1.172 6.828S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.172S22 17.771 22 14v-2.202z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        {searchQuery ? (
                            <>
                                <h3 className="font-medium text-foreground">No results for &ldquo;{searchQuery}&rdquo;</h3>
                                <p>Try a different search term.</p>
                            </>
                        ) : (
                            <>
                                <h3 className="font-medium text-foreground">No projects yet</h3>
                                <p className="mb-4">Create your first project to get started.</p>
                                <Button onClick={handleCreateProject} variant="outline" className="mt-1 px-4 rounded-full">
                                    <PlusIcon /> Create project
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-6">
                        {filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onOpen={(id) => router.push(`/edit/${id}`)}
                                onDelete={handleDeleteProject}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
