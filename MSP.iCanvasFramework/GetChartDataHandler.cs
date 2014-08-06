using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace MSP.iCanvasFramework
{
    public class GetChartDataHandler : IHttpHandler
    {
        /*Request Parameter      
        */
        private string timeUnit = "hours";
        private int pointCount = 13;
        private string dataFormat = "array";

        private int lineCount = 2;

        /******/

        public void ProcessRequest(HttpContext context)
        {
            timeUnit = context.Request.QueryString["timeunit"];
            timeUnit = timeUnit == null ? "hours" : timeUnit.ToLower();

            lineCount = Convert.ToInt32(context.Request.QueryString["linecount"]);
            lineCount = lineCount <= 0 ? 2 : lineCount;
            pointCount = Convert.ToInt32(context.Request.QueryString["pointcount"]);
            pointCount = pointCount <= 0 ? 13 : pointCount;
            dataFormat = context.Request.QueryString["dataformat"] ?? "array";


            switch (timeUnit)
            {
                case "hours":
                    {
                        GetDataByHours(context);
                        break;
                    }
                case "day":
                    {
                        GetDataByDay(context);
                        break;
                    }
                default:
                    {
                        break;
                    }
            }

        }
        public void GetDataByHours(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";
            Func<double, DateTime> func = DateTime.Now.AddHours;

            List<HeartbeatEntry> hList = new List<HeartbeatEntry>();
            string[] keys = new string[pointCount + 1];
            string key = string.Empty;
            Random rd = new Random();
            int max = 500;
            int min = 0;
            List<ArrayList> links = new List<ArrayList>();
            for (int i = 0; i < lineCount; i++)
            {
                if (i == 0)
                {
                    max = 500;
                    min = 200;
                }
                else
                {
                    max = 120;
                    min = 0;
                }
                ArrayList alist = new ArrayList();
                for (int j = pointCount; j >= 0; j--)
                {
                    DateTime dkey = func(0 - Convert.ToDouble(j));
                    keys[j] = keys[j] ?? dkey.ToString("HH:00");
                    key = keys[j];
                    string value = rd.Next(min, max).ToString();



                    HeartbeatEntry hbEntry = new HeartbeatEntry()
                    {
                        key = key,
                        value = value,
                        links = new List<Link>() 
                        { 
                            new Link()
                            {
                                url=@"http://www.baidu.com",
                                text=value
                            },
                            new Link()
                            {
                                url = @"http://www.sina.com",
                                text = value + "1"
                            },
                            new Link()
                            {
                                url = @"http://www.qq.com",
                                text = value + "2"
                            }         
                                 
                        }
                    };
                    alist.Add(hbEntry);
                }
                links.Add(alist);
                hList.Add(alist[alist.Count - 1] as HeartbeatEntry);
            }

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = "";
            if (dataFormat == "array")
            {

                result = jss.Serialize(links);
            }
            else
            {

                result = jss.Serialize(hList);
            }
            response.Write(result);

        }
        public void GetDataByDay(HttpContext context)
        {
            Func<double, DateTime> func = DateTime.Now.AddDays;
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";


            List<HeartbeatEntry> hList = new List<HeartbeatEntry>();
            string[] keys = new string[pointCount + 1];
            string key = string.Empty;
            Random rd = new Random();
            int max = 500;
            int min = 0;
            List<ArrayList> links = new List<ArrayList>();
            for (int i = 0; i < lineCount; i++)
            {

                max = 120;
                min = 0;


                ArrayList alist = new ArrayList();
                for (int j = pointCount; j >= 0; j--)
                {
                    DateTime dkey = func(0 - Convert.ToDouble(j));
                    keys[j] = keys[j] ?? dkey.ToString("MM-dd");
                    key = keys[j];
                    string value = rd.Next(min, max).ToString();



                    HeartbeatEntry hbEntry = new HeartbeatEntry()
                    {
                        key = key,
                        value = value,
                        links = new List<Link>() 
                        { 
                            new Link()
                            {
                                url=@"http://www.baidu.com",
                                text=value
                            },
                            new Link()
                            {
                                url = @"http://www.sina.com",
                                text = value + "1"
                            },
                            new Link()
                            {
                                url = @"http://www.qq.com",
                                text = value + "2"
                            }         
                                 
                        }
                    };
                    alist.Add(hbEntry);

                }
                hList.Add(alist[alist.Count - 1] as HeartbeatEntry);
                links.Add(alist);
            }

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = "";
            if (dataFormat == "array")
            {

                result = jss.Serialize(links);
            }
            else
            {
                result = jss.Serialize(hList);
            }
            response.Write(result);
        }

        public bool IsReusable
        {
            get { return true; }
        }
    }

    public class HeartbeatEntry
    {

        public string key { get; set; }
        public string value { get; set; }
        public IEnumerable<Link> links { set; get; }
    }
    public class Link
    {
        public string url { get; set; }
        public string text { get; set; }
    }

}