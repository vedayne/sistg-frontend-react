"use client";
import { useAuth } from "@/contexts/auth-context";
import HomePage from "@/components/home-page";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Page() {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [loading, user, router]);
    if (loading) {
        return (<div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>);
    }
    if (user) {
        return (<div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>);
    }
    return <HomePage />;
}
