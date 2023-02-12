import React from "react";
import { BsFillMicFill, BsXLg } from "react-icons/bs";
import {cloneDeep} from 'lodash';

const SearchEngine = () => {
    const [data, setData] = React.useState([]);
    const [fixdata, setFixdata] = React.useState([]);
    const [model, setModal] = React.useState(false);
    const [start, setStart] = React.useState(false);
    const [recognitions, setRecognitions] = React.useState("")
   
    const reftextarea = React.useRef();
    const refTextbox = React.useRef()

    // React.useEffect(() => {
    //     SFSpeechRecognizer.requestAuthorization { (authStatus) in
    //         switch authStatus {
    //             case .authorized:
    //                 // User gave access to speech recognition
    //                 // 2. Create a speech recognizer
    //                 let recognizer = SFSpeechRecognizer()
    //                 // 3. Create recognition request
    //                 let request = SFSpeechURLRecognitionRequest(url: audioFileURL)
    //                 // 4. Start recognition task
    //                 recognizer?.recognitionTask(with: request) { (result, error) in
    //                     guard let result = result else {
    //                         // Handle the error
    //                         return
    //                     }
    //                     // 5. Update your app's UI with the result
    //                     self.textView.text = result.bestTranscription.formattedString
    //                 }
    //             // Handle other authorization statuses
    //             default:
    //                 break
    //         }
    //     }
    // },[])

    React.useEffect(() => {
        fetch('https://dummyjson.com/users')
        .then(res => res.json())
        .then(json => {
            if (json && json.users) {
                setFixdata(json.users)
                setData(json.users)
            }
        })
        .catch(e => console.log(e))
    },[])

    function debounce(func, timeout){
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
    const Search = debounce((e) => {
        const valu = e.target.value;
        let relativeData = []
        if (valu) {
            relativeData = [valu]
            fetch(`https://api.datamuse.com/words?ml=${valu}&max=4`)
            .then(res => res.json())
            .then(result => {
                const res = result && result.length > 0 ? result.map(r => r.word) : [];
                relativeData = [...relativeData, ...res]
            })
            .catch(e => console.log(e))
            
        } else {
            relativeData = "" 
        }
        const newData = cloneDeep(fixdata);
        const newArr = valu ? newData.filter(obj => relativeData ? relativeData.some(val => (obj.firstName +' '+obj.lastName +' '+obj?.address?.address).toString().toLowerCase().includes(val.toLowerCase())):false) : newData;
        setData(newArr)
    }, 500)

    const dependency = React.useMemo(() => {
        return fixdata;
     }, [fixdata]);

    React.useEffect(() => {
        const SpeechRecognition =  window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = ""
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.onstart = () => {
                console.log("starting listening, speak in microphone");
            } 
            const newData = cloneDeep(fixdata);
            recognition.addEventListener("result", (e)=> resultOfSpeechRecognition(e,recognition, newData));
            recognition.addEventListener("start", startSpeechRecognition); 
            recognition.addEventListener("end", endSpeechRecognition);
            setRecognitions(recognition)
        } else {
            console.log("Your Browser does not support speech Recognition");
        }
    },[dependency])

   


    React.useEffect(()=> {
        if(recognitions){
            if(model) { // Start Voice Recognition
                recognitions.start(); // First time you have to allow access to mic!
            }
            else {
                recognitions.stop();
            }
        }
    },[model])

    function startSpeechRecognition() {
        console.log("Voice activated, SPEAK");
    }

    function endSpeechRecognition() {
        console.log("Speech recognition service disconnected");
        console.log("reftextarea.current.value", reftextarea)
       
    }

    function resultOfSpeechRecognition(event, recognition, newData) {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        if(transcript.toLowerCase().trim()==="stop recording") {
            recognition.stop();
        }
        else if(!reftextarea.current.value) {
            reftextarea.current.value = transcript;
        }
        else {
            if(transcript.toLowerCase().trim()==="go") {
               // searchForm.submit();
            }
            else if(transcript.toLowerCase().trim()==="reset input") {
                reftextarea.current.value = ""
            }
            else {
                reftextarea.current.value = transcript
            }
        }
        
        setTimeout(()=>{
            refTextbox.current.value = reftextarea.current.value;
            const relativeData = [refTextbox.current.value]
            const newArr = refTextbox.current.value ? newData.filter(obj => relativeData ? relativeData.some(val => (obj.firstName +' '+obj.lastName +' '+obj?.address?.address).toString().toLowerCase().includes(val.toLowerCase())):false) : newData;
            setData(newArr)
        },500)
        
    }

    const voiceSearch = () => {
        setModal(true);
    }

    return (
        <div className="mt-8">
            <h1 className="text-6xl">Search Engine</h1>
            <div className="mt-10 relative"><input ref={refTextbox} className="border rounded-full p-5 w-96 pr-11 " type="search" onChange={(e) => Search(e)} /><button onClick={voiceSearch} className="-ml-11 align-middle p-1 rounded-full -mt-1 active:bg-gray-200"><BsFillMicFill size={30}  /></button></div>
            <div className="mt-5">
                {data.map(item => (
                    <div className="p-3">{item?.firstName} {item?.lastName} {item?.address?.address}</div>
                ))}
            </div>
            {model && <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div className="absolute top-2 right-3"><button onClick={()=>setModal(false)}><BsXLg /></button></div>
                            <div className="bg-white h-72 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                               <div className="text-center text-lg font-bold">Listing...</div>
                               <textarea type="text" className="w-full h-60 p-5"  readOnly={true} ref={reftextarea} > </textarea>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse  justify-center sm:px-6">
                                <button onClick={() =>setStart(!start)} type="button" className="mt-3 bg-red-700 inline-flex w-full justify-center rounded-full p-2  text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"><BsFillMicFill size={30} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}
export default SearchEngine;