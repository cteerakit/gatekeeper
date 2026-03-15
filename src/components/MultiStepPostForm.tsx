import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Users, Briefcase, Megaphone, Check, Link as LinkIcon, Pin, CreditCard, Image as ImageIcon, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGroups } from "@/hooks/useGroups"

interface MultiStepPostFormProps {
    submitPost: (content: string, files: File[]) => Promise<void>
    onSuccess?: () => void
}

export function MultiStepPostForm({ submitPost, onSuccess }: MultiStepPostFormProps) {
    const { t } = useTranslation()
    const { groups, isLoading: isLoadingGroups } = useGroups()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const formSchema = z.object({
        group: z.string().min(1, { message: t("form.validation_group_required") }),
        type: z.string().min(1, { message: t("form.validation_type_required") }),
        content: z.string().min(10, { message: t("form.validation_min_length") }),
        pinPost: z.boolean(),
    })

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            group: "",
            type: "",
            content: "",
            pinPost: false,
        },
    })

    const nextStep = () => {
        const fieldsToValidate: Record<number, (keyof FormValues)[]> = {
            1: ["type"],
            2: ["group"],
            3: ["content"],
            4: ["pinPost"],
        }
        const currentFields = fieldsToValidate[step]
        if (currentFields) {
            form.trigger(currentFields).then((isValid) => {
                if (isValid) setStep((s) => s + 1)
            })
        } else {
            setStep((s) => s + 1)
        }
    }

    const prevStep = () => setStep((s) => Math.max(1, s - 1))

    const handleFinalSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            const selectedGroup = groups.find(g => g.id === values.group)
            // In a real app we'd send all values. Here we combine some into the content.
            const fullContent = `[${selectedGroup?.name || values.group}] [${t(`form.types.${values.type}`)}]\n\n${values.content}`
            await submitPost(fullContent, selectedFiles)
            setStep(6) // Success step
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        form.reset()
        setSelectedFiles([])
        setStep(1)
        if (onSuccess) {
            onSuccess();
        }
    }

    const renderStepIndicator = () => {
        return (
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-200 -z-10 transform -translate-y-1/2"></div>
                <div
                    className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 transform -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${((Math.min(step, 5) - 1) / 4) * 100}%` }}
                ></div>
                {[1, 2, 3, 4, 5].map((s) => (
                    <div
                        key={s}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                            step > s ? "bg-primary border-primary text-white" :
                                step === s ? "bg-white border-primary text-primary shadow-lg scale-110" :
                                    "bg-white border-neutral-300 text-neutral-400"
                        )}
                    >
                        {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Card className="shadow-2xl overflow-hidden border-neutral-200 bg-white relative">
            {(step === 1 || step === 2 || step === 3 || step === 4 || step === 5) && (
                <CardHeader className="bg-neutral-50/50 border-b pb-6 shrink-0">
                    <div className="mb-4">{renderStepIndicator()}</div>
                    <CardTitle className="flex items-center gap-2 text-foreground text-xl">
                        {t(`form.step_${step}`)}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {step === 1 && t("form.post_type")}
                        {step === 2 && t("form.select_group")}
                        {step === 3 && t("form.description")}
                        {step === 4 && t("form.addons")}
                        {step === 5 && t("form.summary")}
                    </CardDescription>
                </CardHeader>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="flex flex-col">
                    <CardContent className="p-6">
                        <div className="min-h-[300px] animate-in slide-in-from-right-4 fade-in duration-300">
                            {/* Step 1: Choose Post Type */}
                            {step === 1 && (
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="grid gap-4 md:grid-cols-2">
                                            {[
                                                { id: "job", icon: Briefcase },
                                                { id: "sponsored", icon: Megaphone }
                                            ].map((tItem) => (
                                                <Card
                                                    key={tItem.id}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                                                        field.value === tItem.id ? "border-primary bg-primary/5 ring-1 ring-primary scale-[1.02]" : ""
                                                    )}
                                                    onClick={() => form.setValue("type", tItem.id, { shouldValidate: true })}
                                                >
                                                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                                            field.value === tItem.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                                        )}>
                                                            <tItem.icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-foreground">{t(`form.types.${tItem.id}`)}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1">{t(`form.types.${tItem.id}_desc`)}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            
                                            <div className="col-span-full mt-2 p-4 bg-muted/30 border border-neutral-200 rounded-xl text-muted-foreground text-sm flex items-start gap-3">
                                                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <Info className="w-3 h-3 text-primary" />
                                                </div>
                                                <p>{t("form.post_type_free_note")}</p>
                                            </div>

                                            <FormMessage className="col-span-full" />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Step 2: Choose Group */}
                            {step === 2 && (
                                <FormField
                                    control={form.control}
                                    name="group"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            {isLoadingGroups ? (
                                                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                                            ) : groups.map((g) => (
                                                <Card
                                                    key={g.id}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:border-primary/50 hover:bg-neutral-50 border-neutral-200",
                                                        field.value === g.id ? "border-primary ring-1 ring-primary bg-primary/5" : ""
                                                    )}
                                                    onClick={() => form.setValue("group", g.id, { shouldValidate: true })}
                                                >
                                                    <CardContent className="p-4 flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-colors",
                                                            field.value === g.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                                        )}>
                                                            <Users className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-foreground text-[15px] leading-tight">{g.name}</h4>
                                                        </div>
                                                        {field.value === g.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Step 3: Post Detail */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t("form.description_label")}</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t("form.placeholder")}
                                                        className="min-h-[140px] bg-white resize-none transition-all focus-visible:ring-primary/50"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> {t("form.visual_assets")}
                                            </label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])
                                                    }
                                                }}
                                                className="bg-white cursor-pointer py-2 h-10 file:bg-primary/10 file:text-primary file:font-semibold file:border-0 file:rounded-md file:px-3 file:mr-4 hover:file:bg-primary/20 transition-all text-sm"
                                            />
                                        </div>

                                        {selectedFiles.length > 0 && (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                                                {selectedFiles.map((file, idx) => (
                                                    <div key={`${file.name}-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-white">
                                                        <img 
                                                            src={URL.createObjectURL(file)} 
                                                            alt="preview" 
                                                            className="w-full h-full object-cover"
                                                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Add-ons */}
                            {step === 4 && (
                                <FormField
                                    control={form.control}
                                    name="pinPost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Card
                                                className={cn(
                                                    "cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                                                    field.value ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                                                )}
                                                onClick={() => form.setValue("pinPost", !field.value, { shouldValidate: true })}
                                            >
                                                <CardContent className="p-6 flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                                        field.value ? "bg-primary border-primary text-white" : "border-neutral-300"
                                                    )}>
                                                        {field.value && <Check className="w-4 h-4" />}
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                        <Pin className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground">{t("form.pin_post")}</h4>
                                                        <p className="text-xs text-muted-foreground">{t("form.pin_post_desc")}</p>
                                                    </div>
                                                    <div className="font-bold text-lg text-primary">฿250</div>
                                                </CardContent>
                                            </Card>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Step 5: Summary */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="rounded-xl border border-neutral-200 overflow-hidden text-sm">
                                        <div className="bg-neutral-50 p-4 border-b flex justify-between items-center gap-4">
                                            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs flex-shrink-0">{t("form.step_1")}</span>
                                            <span className="font-bold">{t(`form.types.${form.getValues("type")}`)}</span>
                                        </div>
                                        <div className="bg-white p-4 border-b flex justify-between items-center">
                                            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">{t("form.step_2")}</span>
                                            <span className="font-bold text-right line-clamp-1">{groups.find(g => g.id === form.getValues("group"))?.name}</span>
                                        </div>
                                        {form.getValues("pinPost") && (
                                            <div className="bg-neutral-50 p-4 border-b flex justify-between items-center text-orange-600">
                                                <span className="font-semibold uppercase tracking-wider text-xs flex items-center gap-1"><Pin className="w-3 h-3" /> {t("form.pin_post")}</span>
                                                <span className="font-bold">+฿250</span>
                                            </div>
                                        )}
                                        <div className="bg-primary/5 p-4 flex justify-between items-center">
                                            <span className="text-primary font-bold uppercase tracking-wider text-sm">{t("form.total")}</span>
                                            <span className="font-extrabold text-xl text-primary">{form.getValues("pinPost") ? "฿250" : t("form.free")}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                                        <CreditCard className="w-4 h-4" /> {t("form.secure_payment_notice")}
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Success */}
                            {step === 6 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">{t("form.success_title")}</h3>
                                    <p className="text-muted-foreground max-w-sm">{t("form.success_desc")}</p>
                                    <Button onClick={handleReset} variant="outline" className="mt-8">
                                        {t("form.back_to_dashboard")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    {(step >= 1 && step <= 5) && (
                        <CardFooter className="bg-neutral-50/50 border-t p-6 flex justify-between gap-4 mt-auto">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={prevStep} className="font-semibold">
                                    <ChevronLeft className="w-4 h-4 mr-1" /> {t("form.back")}
                                </Button>
                            ) : <div></div>}

                            {step < 5 ? (
                                <Button type="button" onClick={nextStep} className="font-semibold">
                                    {t("form.next")} <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-md bg-primary hover:bg-primary/90 text-white min-w-[140px]">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("form.pay_and_submit")}
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </form>
            </Form>
        </Card>
    )
}
