import { auth } from "@/auth";
import { supabaseServerClient } from "@/src/lib/supabase-server";
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = "media-uploads";

export async function POST(req: Request) {
   const session=await auth();
   if(!session?.user?.id){
    return NextResponse.json({error:"Unauthorized"},{status:401});
   }
   const userId=session.user.id;
   
   try{
    const {fileName, contentType}=await req.json();
    if(!fileName || !contentType){
        return NextResponse.json({error:"File name and content type are required"},{status:400});
    }
    const fileExtension=fileName.split('.').pop() || '';
    const uniqueFileName=`${uuidv4()}.${fileExtension}`;

    const filePath=`${userId}/${uniqueFileName}`; // Esempio: id-utente-123/random-uuid.mp4
    console.log(`Generazione URL per upload del file: ${filePath}, tipo di contenuto: ${contentType}`);

    const {data,error}=await supabaseServerClient
    .storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(filePath);

    if(error){
        console.error("Errore nella generazione dell'URL firmato per l'upload:",error);
        const message = error.message || 'Errore generazione signed URL'; 
        throw new Error(message);
    }
    if(!data?.signedUrl){
        console.error("Dati firmati non validi restituiti dalla API di Supabase:", data);
        throw new Error("URL firmato non valido restituito dalla API di Supabase");
   }

   console.log("URL firmato generato con successo");

   return NextResponse.json({
    signedUrl:data.signedUrl,
    filePath:filePath
   });
   }catch(error){
    console.error("Errore nella generazione dell'URL per l'upload:",error);
    const errorMessage=error instanceof Error ? error.message : "Errore interno del server";
    return NextResponse.json({error:errorMessage},{status:500});
   }
}