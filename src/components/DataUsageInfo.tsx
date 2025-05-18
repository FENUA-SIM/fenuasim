"use client"

interface DataUsageInfoProps {
  data: string
  language: string
}

export default function DataUsageInfo({ data, language }: DataUsageInfoProps) {
  const usageInfo = [
    {
      icon: "📱",
      title: language === "fr" ? "Navigation web" : "Web browsing",
      usage: language === "fr" ? "~100 Mo/heure" : "~100 MB/hour",
    },
    {
      icon: "🎵",
      title: language === "fr" ? "Streaming audio" : "Audio streaming",
      usage: language === "fr" ? "~50 Mo/heure" : "~50 MB/hour",
    },
    {
      icon: "🎥",
      title: language === "fr" ? "Streaming vidéo" : "Video streaming",
      usage: language === "fr" ? "~500 Mo/heure" : "~500 MB/hour",
    },
    {
      icon: "📸",
      title: language === "fr" ? "Photos et vidéos" : "Photos and videos",
      usage: language === "fr" ? "~5 Mo/photo" : "~5 MB/photo",
    },
    {
      icon: "📧",
      title: language === "fr" ? "Emails" : "Emails",
      usage: language === "fr" ? "~100 Ko/email" : "~100 KB/email",
    },
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-fenua-purple mb-3">
        {language === "fr"
          ? `Avec ${data} de données, vous pouvez :`
          : `With ${data} of data, you can:`}
      </h4>
      <ul className="space-y-2">
        {usageInfo.map((item, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <span className="mr-2">{item.icon}</span>
            <span>{item.title}</span>
            <span className="ml-auto text-fenua-purple">{item.usage}</span>
          </li>
        ))}
      </ul>
    </div>
  )
} 