// Setup Canvas
const canvas = document.getElementById("AlgorithmCanvas");
const ctx = canvas.getContext("2d");

// Setup Variables
barArray = [];
lastShuffledBarArray = [];
numBarsToMake = 256;
circleCentreX = Math.round(canvas.width/2);
circleCentreY = Math.round(canvas.height/2);
minBarHeight = 50;
maxBarHeight = 500;
drawStyle = "rectangle";
arraySuffledBefore = false;
shuffling = false;
sortArray = false;
runBogo = false;

// Class for the bar
class SortBar {
    width = 50;
    height = 100;
    value = 10;
    index = 0;
    color = 0;

    constructor(inputIndex, inputValue, inputWidth, inputHeight){
        this.index = inputIndex;
        this.value = inputValue;
        this.width = inputWidth;
        this.height = inputHeight;
    }

    Draw(){
        // Decide on the colour to fill the bar with
        // Let's try to change this so that we draw it in a circle
        if (drawStyle === "rectangle"){
            if (this.color === 0){ ctx.fillStyle = "white"; }
            else if (this.color === 1) { ctx.fillStyle = "red"; }
            else if (this.color === 2) { ctx.fillStyle = "green"; }
            else if (this.color === 3) { ctx.fillStyle = "blue"; }
            else { ctx.fillStyle = "white"; }

            ctx.fillRect((this.index * (this.width + 1)),(canvas.height - this.height),this.width,this.height);
        }
        else if (drawStyle == "circle"){
            // Implement code to draw bars as sectors of a circle instead of bars in a row (little more fun and unique)
            
        }
    }

    SetWidth(newWidth) { this.width = newWidth; }
    SetHeight(newHeight) { this.height = newHeight; }
    SetValue(newValue) { this.value = newValue; }
    SetIndex(newIndex) { this.index = newIndex; }
    SetColor(newColor) { this.color = newColor; }
}

// Audio Stuff
const audioCtx = new AudioContext({ sampleRate: 48000});

// Main program
async function drawBars(){
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the bars
    for (i = 0; i < barArray.length; i++){
        barArray[i].Draw();
    }
}

function createBars(){
    for (i = 0; i < numBarsToMake; i++){
        barArray[i] = new SortBar(i, i, (canvas.width/numBarsToMake) - 1, (canvas.height * (i + 1))/numBarsToMake);
    }
}

function adjustBarSize(){
    for (i = 0; i < numBarsToMake; i++){
        barArray[i].SetHeight((canvas.height / (numBarsToMake + 1)) * (barArray[i].value + 1));
        barArray[i].SetWidth((canvas.width/numBarsToMake) - 1);
    }
}

function sleep(ms = 5){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playBleep(value = 0, duration = 5) {
    let frequency = Math.floor((((value/(barArray.length) * 100) * 10) + 500));
    let decay = 0.05;
    let currentTime = audioCtx.currentTime;
    const oscNode = new OscillatorNode(audioCtx, {type: "square", frequency: frequency});
    const gainNode = new GainNode(audioCtx, {gain: 0});
    oscNode.connect(gainNode).connect(audioCtx.destination);

    oscNode.frequency.setValueAtTime(frequency, currentTime);
    oscNode.start(currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.001);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + decay + 0.001);
    oscNode.stop(currentTime + decay + 0.001);
}

async function shuffleBars(fromBogo = false){
    if (!fromBogo) { 
        runBogo = false; 
    }
    shuffling = true;
    for (let index = (barArray.length - 1); index > 0; index--){
        // Find a random index past i (or i)
        newIndex = Math.floor(Math.random() * index);
        
        barArray = await swapIndexes(barArray, newIndex, index);
        if (!shuffling){
            break;
        }
    }
    shuffling = false;
    await drawBars();
}

async function bogoSort(){
    shuffling = true;
    arraySorted = false;
    if (runBogo){ runBogo = false;}
    else { runBogo = true;}
    while (!arraySorted && runBogo){
        await shuffleBars(true);
        arraySorted = true;
        for (let index = 0; index < (barArray.length - 1); index++){
            if (barArray[index].value > barArray[index+1].value){
                arraySorted = false;
            }
        }
    }
    if (arraySorted){
        greenPass();
    }
    runBogo = false;
    shuffling = false;
}

async function bubbleSort(){

    let elementSwapped = true;
    let numIterations = 0;
    shuffling = true;
    while (elementSwapped){
        elementSwapped = false;
        numIterations++;
        for (let index = 0; index < barArray.length-numIterations; index++){
            if (barArray[index+1].value < barArray[index].value){
                // Swap the indexes
                barArray = await swapIndexes(barArray, index, index + 1);
                elementSwapped = true;
            }
            else{
                barArray[index].SetColor(2);
                barArray[index + 1].SetColor(2);
                playBleep(index);
                drawBars();
                await sleep();
                barArray[index].SetColor(0);
                barArray[index + 1].SetColor(0);
            }             
        }
        await drawBars(); 
    }

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function insertionSort(){
    shuffling = true;
    
    for (let unsortedIndex = 1; unsortedIndex < barArray.length; unsortedIndex++){
        let index = unsortedIndex;
        while (barArray[index].value < barArray[index-1].value){
            // Swap the elements
            barArray = await swapIndexes(barArray, index, index - 1);
            if (index > 1) { index--; }
            else { 
                barArray[index].SetColor(2);
                barArray[index - 1].SetColor(2);
                playBleep(index);
                drawBars();
                await sleep(); 
                barArray[index].SetColor(0);
                barArray[index - 1].SetColor(0);
                break; 
            }
        }
    }
    greenPass();
    shuffling = false;
}


async function selectionSort(){
    shuffling = true;
    for (let index1 = 0; index1 < barArray.length - 1; index1++){
        for (let index2 = index1 + 1; index2 < barArray.length; index2++){
            // barArray[j] will be after barArray[i] in the array. So if barArray[j] is smaller, they need to be swapped
            if (barArray[index2].value < barArray[index1].value){
                // Swap the indexes
                barArray = await swapIndexes(barArray, index1, index2);
            }
            else{
                await sleep();
            }      
        }
    }
    await drawBars();

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function saltShakerSort(){
    let elementSwapped = true;
    let numIterations = 0;
    shuffling = true;
    while (elementSwapped){
        elementSwapped = false;
        numIterations++;
        if (numIterations % 2 == 1){
            for (let index = Math.floor(numIterations/2); index < barArray.length-Math.floor(numIterations/2) - 1; index++){
                if (barArray[index+1].value < barArray[index].value){
                    // Swap the indexes
                    barArray = await swapIndexes(barArray, index, index + 1);
                    elementSwapped = true;
                }  
                else{
                    await sleep();
                }           
            }
        }
        else{
            for (let index = barArray.length-Math.floor(numIterations/2) - 1; index > Math.floor(numIterations/2)-1; index--){
                if (barArray[index-1].value > barArray[index].value){
                    // Swap the indexes
                    barArray = await swapIndexes(barArray, index, index - 1);
                    elementSwapped = true;
                }
                else{
                    await sleep();
                }            
            }        
        }

        await drawBars(); 
    }

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function gnomeSort(){
    shuffling = true;
    let i = 0;
    while (i < barArray.length - 1){
        if (barArray[i].value > barArray[i+1].value){
            // Swap indexes
            barArray = await swapIndexes(barArray, i, i + 1)
            // Move back one
            if (i > 0){
                barArray[i].SetColor(0);
                i--;
                barArray[i].SetColor(3);
            }
        }
        else{
            barArray[i].SetColor(0);
            i++;
            barArray[i].SetColor(3);
        }
    }
    shuffling = false;
    greenPass();
}

async function combSort() {
    shuffling = true;

    let elementSwapped = false;
    let gapSize = barArray.length;
    let gap = Math.floor(gapSize);
    shuffling = true;
    while (!elementSwapped || gap > 1){
        gapSize = gapSize/1.3;
        gap = Math.floor(gapSize);
        elementSwapped = false;
        for (let index = 0; index < barArray.length-gap; index++){
            if (barArray[index+gap].value < barArray[index].value){
                // Swap the indexes
                barArray = await swapIndexes(barArray, index + gap, index);
                elementSwapped = true;
            }
            else{
                barArray[index].SetColor(1); 
                barArray[index + gap].SetColor(1); 
                await drawBars();
                await sleep(); 
                barArray[index].SetColor(0);
                barArray[index + gap].SetColor(0); 
            }      
        }
        await drawBars(); 
    }    


    greenPass();
    shuffling = false;
}

async function reverseBarSubArray(endIndex, array = barArray){
    // Part of pancake sort
    for (let i = 0; i < Math.round(endIndex/2); i++){
        temp = array[endIndex - i]
        array[endIndex-i] = array[i];
        array[endIndex-i].SetIndex(endIndex-i);
        array[i] = temp;
        array[i].SetIndex(i);

        barArray[i].SetColor(1);
        barArray[endIndex-i].SetColor(1);
        playBleep(barArray[i].value);
        await drawBars();
        await sleep();
        barArray[i].SetColor(0);
        barArray[endIndex-i].SetColor(0); 
    }
}

async function pancakeSort(){
    shuffling = true;
    // Like selection, we find the next element we need. We then flip that element so it's the first element in the list
    // We then flip the whole unsorted portion so that the next element that we need is in the correct position in the array
    let numSortedElements = 0;
    while (numSortedElements < barArray.length){
        let nextElementToSort = 0;
        // Find the element we want to flip (greatest element in unsorted array)
        for (let i = 0; i < barArray.length-numSortedElements; i++){
            if (barArray[i].value > barArray[nextElementToSort].value){
                nextElementToSort = i;
            }
            barArray[i].SetColor(1);
            playBleep(barArray[i].value);
            await drawBars();
            await sleep();
            barArray[i].SetColor(0);
        }
        if (nextElementToSort != 0){
            await reverseBarSubArray(nextElementToSort);
        }
        await reverseBarSubArray(barArray.length - numSortedElements - 1);
        numSortedElements++;
    }

    greenPass();
    shuffling = false;
}

async function mergeSort(subArray, trueArrayStartIndex){
    if (subArray.length > 1){
        let newArrayLength = Math.floor(subArray.length/2);
        let dividedArray1 = subArray.slice(0, newArrayLength);
        let dividedArray2 = subArray.slice(newArrayLength, subArray.length);
        dividedArray1 = await mergeSort(dividedArray1, trueArrayStartIndex);
        dividedArray2 = await mergeSort(dividedArray2, trueArrayStartIndex + newArrayLength);
        // Sort the two (sorted) arrays
        let dividedArrayIndex1 = 0;
        let dividedArrayIndex2 = 0;

        for (let i = 0; i < subArray.length; i++){
            let tempIndex = subArray[i].index;
            if (dividedArrayIndex1 < dividedArray1.length && dividedArrayIndex2 < dividedArray2.length){
                if (dividedArray1[dividedArrayIndex1].value < dividedArray2[dividedArrayIndex2].value){
                    subArray[i] = dividedArray1[dividedArrayIndex1];
                    subArray[i].index = i + trueArrayStartIndex;
                    dividedArrayIndex1++;
                }
                else {
                    subArray[i] = dividedArray2[dividedArrayIndex2];
                    subArray[i].index = i + trueArrayStartIndex;
                    dividedArrayIndex2++;
                }
            }
            else if (dividedArrayIndex1 < dividedArray1.length){
                subArray[i] = dividedArray1[dividedArrayIndex1];
                subArray[i].index = i + trueArrayStartIndex;
                dividedArrayIndex1++;
            }
            else{
                subArray[i] = dividedArray2[dividedArrayIndex2];
                subArray[i].index = i + trueArrayStartIndex;
                dividedArrayIndex2++;
            }

            subArray[i].SetColor(1);
            playBleep(barArray[i].value);
            await drawBars();
            await sleep();
            subArray[i].SetColor(0);
        }
    }

    return subArray
}

async function quickSort(subArray, trueArrayStartIndex){
    if (subArray.length > 1){
        // Pivot on the middle element
        pivot = subArray[Math.floor(Math.random() * subArray.length)];
        pivot.SetColor(3);
        let lessThanArray = [];
        let greaterThanArray = [];
        // Actually Sort the array...
        for (let i = 0; i < subArray.length; i++){
            if (subArray[i].value < pivot.value){
                lessThanArray.push(subArray[i]);
            }
            else{
                greaterThanArray.push(subArray[i]);
            }
        }

        // Rerun through to do the animatic (we need to know how many elements are on each side to draw it... :( ))
        for (let i = 0; i < lessThanArray.length; i++){
            lessThanArray[i].index = trueArrayStartIndex + i;
            lessThanArray[i].SetColor(1);
            playBleep(lessThanArray[i].value);
            await drawBars();
            await sleep();
            lessThanArray[i].SetColor(0);
        }
        for (let i = 0; i < greaterThanArray.length; i++){
            greaterThanArray[i].index = trueArrayStartIndex + lessThanArray.length + i;
            greaterThanArray[i].SetColor(1);
            playBleep(greaterThanArray[i].value);
            await drawBars();
            await sleep();
            greaterThanArray[i].SetColor(0);
        }
                
        // Continue to pivot and split until we reach an array with only one element
        lessThanArray = await quickSort(lessThanArray, trueArrayStartIndex);
        greaterThanArray = await quickSort(greaterThanArray, trueArrayStartIndex + lessThanArray.length);

        // Reconstruct a sorted subarray to return to the caller
        subArray = lessThanArray.concat(greaterThanArray);
    }
    return subArray;
}

// Functions required for Heap Sort

async function heapSort(arrayToSort){
    virtualArrayLength = (arrayToSort.length);
    arrayToSort = await buildMaxHeap(arrayToSort);
    for (let i = (arrayToSort.length - 1); i >= 0; i--){
        // Swap arrayToSort[0] and arrayToSort[i]
        arrayToSort = await swapIndexes(arrayToSort, 0, i);
        virtualArrayLength = virtualArrayLength - 1;
        arrayToSort = await heapify(arrayToSort, 0);
    }

    return arrayToSort;
}

async function buildMaxHeap(arrayToSort){
    for (let i = Math.floor(virtualArrayLength / 2); i >= 0; i--){
        arrayToSort = await heapify(arrayToSort, i);
    }
    return arrayToSort;
}

async function heapify(arrayToSort, i){
    let leftElement = 2 * i + 1;
    let rightElement = 2 * i + 2;
    let maxElement = 0;

    if (leftElement < virtualArrayLength && arrayToSort[leftElement].value > arrayToSort[i].value){
        maxElement = leftElement;
    }
    else {
        maxElement = i;
    }

    if (rightElement < virtualArrayLength && arrayToSort[rightElement].value > arrayToSort[maxElement].value){
        maxElement = rightElement;
    }

    if (maxElement != i){
        arrayToSort = await swapIndexes(arrayToSort, i, maxElement);
        arrayToSort = await heapify(arrayToSort, maxElement);
    }

    return arrayToSort;
}

// Algorithms for odd even sort // 
async function oddEvenSort(arrayToSort){
    // Works similarly to bubble sort but compares pairs of odd and even indexed elements (eg. in list 1, 5, 9, 7
    // it compares 1, 5 and 7, 9. Then second pass compares 5, 7 (which is now in position 2 instead of 9). )
    // Complexity: n^2
    let sorted = false;

    while (sorted == false){
        sorted = true;
        for (let i = 0; i < arrayToSort.length - 1; i += 2){
            if (arrayToSort[i + 1].value <= arrayToSort[i].value){
                arrayToSort = await swapIndexes(arrayToSort, i, i+1);
                sorted = false;
            }
        }
        for (let i = 1; i < arrayToSort.length - 1; i += 2){
            if (arrayToSort[i + 1].value <= arrayToSort[i].value){
                arrayToSort = await swapIndexes(arrayToSort, i, i+1);
                sorted = false;
            }
        }
    }

    return arrayToSort;
}

// Algorithms for radix sort
async function radixSort(arrayToSort){
    // Temp code //
    let maxPlaceValue = 3;
    // Radix sort works by placing numbers into "buckets" based on their least significant digit.
    for (let i = 0; i < maxPlaceValue; i++){
        let buckets = [];
        for (let j = 0; j < 10; j++){
            buckets.push([]);
        }

        for (let j = 0; j < arrayToSort.length; j++){
            digit = await getDigitAtPlace(arrayToSort[j].value, i);
            buckets[digit].push(arrayToSort[j]);
        }

        // Adjust the indexes to reflect the change in position //
        let totalLength = 0;
        for (let j = 0; j < buckets.length; j++){
            bucket = buckets[j];
            for (let k = 0; k < bucket.length; k++){
                bucket[k].SetIndex(totalLength);
                bucket[k].SetColor(1);
                await drawBars();
                await playBleep(bucket[k].value);
                await sleep();
                bucket[k].SetColor(0);
                totalLength++;
            }
        }

        let tempSortedArray = [];
        for (let j = 0; j < buckets.length; j++){
            bucket = buckets[j];
            tempSortedArray = tempSortedArray.concat(bucket);
        }
        arrayToSort = tempSortedArray;
    }

    return arrayToSort;
}

async function getDigitAtPlace(value, place){
    return Math.floor(value / ( Math.pow(10, place) ) ) % 10;
}

// Algorithms for shell sort //

async function shellSort(arrayToSort){
    let gapSize = arrayToSort.length;
    
    while (gapSize > 1){
        gapSize = Math.floor(gapSize / 1.3);
        for (let i = gapSize; i < arrayToSort.length; i++){
            let index = i;
            while (arrayToSort[index].value < arrayToSort[index-gapSize].value){
                // Swap the elements
                arrayToSort = await swapIndexes(arrayToSort, index, index - gapSize);
                if ((index - gapSize) > gapSize) { index -= gapSize; }
                else { break; }
            }
            //await correctOrderComparison(arrayToSort, index, index - gapSize);
        }
    }

    return arrayToSort;
}

// Algorithms for bitonic sort
async function bitonicSort(listToSort){
    // Make the list bitonic
    listToSort = await bitonicBuild(listToSort);
    // Sort the bitonic list
    listToSort = await bitonicSplit(listToSort);

    return listToSort;
}

async function bitonicSplit(bitonicListToSplit, trueStartIndex = 0){
    // Sorts any bitonic list and retruns the sorted list
    // Cuts the bitonic list into two smaller ones, where all the elements in the first bitonic sequence are
    // smaller than the elements in the second bitonic sequence (on an element by element basis)
    if (bitonicListToSplit.length > 1){
        for (let i = 0; i < bitonicListToSplit.length / 2; i++){
            // Compare each element of the first half with each elemenet of the second half and swap so second half > first half for every individual element
            let n = bitonicListToSplit.length / 2 + i;
            if (bitonicListToSplit[i].value > bitonicListToSplit[n].value){
                bitonicListToSplit = await swapIndexes(bitonicListToSplit, i, n, trueStartIndex);
            }
            else{ 
                // Colour the bars and draw
                bitonicListToSplit[i].SetColor(1); 
                bitonicListToSplit[n].SetColor(1); 
                await drawBars();
                await sleep(); 
                bitonicListToSplit[i].SetColor(0); 
                bitonicListToSplit[n].SetColor(0); 
            }
        }
        // We split the bitonic list in half and have two (half sorted) lists
        let smallerSubList = bitonicListToSplit.slice(0, bitonicListToSplit.length/2);
        let largerSubList = bitonicListToSplit.slice(bitonicListToSplit.length/2, bitonicListToSplit.length);

        // Then we iteratively perform bitonic splits until the list length is 2 (which is always bitonic)
        smallerSubList = await bitonicSplit(smallerSubList, trueStartIndex);
        largerSubList = await bitonicSplit(largerSubList, trueStartIndex + smallerSubList.length);

        bitonicListToSplit = smallerSubList.concat(largerSubList);
        return bitonicListToSplit;
    }
    return bitonicListToSplit;
}

async function bitonicBuild(listToBuild, trueStartIndex = 0){
    let smallerSubList;
    let largerSubList;
    // Makes the original list into a bitonic one (all elements are in ascending then descending order)
    if (listToBuild.length > 2){
        // Splits the list in half
        smallerSubList = await listToBuild.slice(0, listToBuild.length/2);
        largerSubList = await listToBuild.slice(listToBuild.length/2, listToBuild.length);
        
        // Build both of the sublists into bitonic lists
        smallerSubList = await bitonicBuild(smallerSubList, trueStartIndex);
        largerSubList = await bitonicBuild(largerSubList, trueStartIndex + smallerSubList.length);
    }
    else{ return listToBuild; }
    // Sort the two lists
    smallerSubList = await bitonicSplit(smallerSubList, trueStartIndex);
    largerSubList = await bitonicSplit(largerSubList, trueStartIndex + smallerSubList.length);
    // Reverse larger sub list so that one sequence is ascending and the other decending
    largerSubList = largerSubList.reverse();
    // Adjust indexes to reflect new array position
    for (let i = 0; i < largerSubList.length; i++){
        largerSubList[i].index = i + trueStartIndex + smallerSubList.length;
        await drawBars();
        await sleep(2);
    }
    // Combine to make a new bitonic list
    listToBuild = smallerSubList.concat(largerSubList);
    await drawBars();

    return listToBuild;
}

async function iCantBelieveItCanSort(arrayToSort){
    for (let i = 0; i < arrayToSort.length; i++){
        for (let j = 0; j < arrayToSort.length; j++){
            if (arrayToSort[i].value < arrayToSort[j].value){
                arrayToSort = await swapIndexes(arrayToSort, i, j);
            }
            else{
                arrayToSort[i].SetColor(2);
                arrayToSort[j].SetColor(2);
                playBleep(j);
                drawBars();
                await sleep();
                arrayToSort[i].SetColor(0);
                arrayToSort[j].SetColor(0);
            }
        }
    }

    return arrayToSort;
}

// Entry to each algorithm

async function shuffleBarsEntry(){
    if (!shuffling){
        await shuffleBars();
    }
    for (let i = 0; i < barArray.length; i++){
        // Store the value of the bar at each index. This allows us to reconstruct the array without having to copy a lot of bar objects
        lastShuffledBarArray[barArray[i].value] = barArray[i].index;
    }
    arraySuffledBefore = true;
}

function loadLastShuffledBars(){
    if (!shuffling && arraySuffledBefore == true){
        for (let i = 0; i < barArray.length; i++){
            // Change the index of the element to it's last unshuffled position
            barArray[i].index = lastShuffledBarArray[barArray[i].value];
            barArray[i].SetColor(0);

            if (barArray[i] != barArray[barArray[i].index]){
                // Swap the bar into the place dictated by it's index
                index = barArray[i].index;
                temp = barArray[barArray[i].index];
                barArray[barArray[i].index] = barArray[i];
                barArray[i] = temp;
                // Sets the index to one before the smaller of the two bar's indexes (ensures all bars get sorted)
                if (i > index - 1){
                    i = index - 1;
                }
                else{ i = i - 1; }
            }
        }
        drawBars();
    }
}

async function bubbleSortEntry(){
    // This sort works by swapping adjacent elements until the whole array is sorted
    // Complexity: n^2   
    if (!shuffling){
        await bubbleSort();
    }
}

async function insertionSortEntry(){
    // This sort works by creating a sorted and unsorted array. Each element in the unsorted array is inserted into its correct position in
    // the sorted array until the array is fully sorted
    // Complexity: n^2

    if (!shuffling){
        await insertionSort();
    }
}

async function selectionSortEntry(){
    // This sort works by finding which of the remaining elements should come next and placing it in the correct position
    // Complexity: n^2
    if (!shuffling){
        await selectionSort();
    }
}

async function saltShakerSortEntry(){
    // This sort works similarly to bubble sort but changes the direction of sorting each pass
    // Complexity: n^2
    if (!shuffling){
        await saltShakerSort();
    }   
}

async function gnomeSortEntry(){
    // This algoritm works by the following commands. If the two elements next to eachother are in the correct order, move a step forwards
    // if the two elements are not in the correct order, swap them and move a step backwards
    // Complexity: n^2
    if (!shuffling){
        await gnomeSort();
    }
}

async function combSortEntry() {
    // This algorithm works like bubble sort but instead of comparing adjacent elements, it compares elements with a larger gap size
    // (Imagine going through a list with a finer and finer comb)
    // Complexity: omega(n^2 / 2^p)
    if (!shuffling){
        await combSort();
    }
}

async function shellSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await shellSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function pancakeSortEntry() {
    // This algorithm works under the principle that the array is a stack of pancakes and the only way to sort them is to place a
    // spatula between the elements and flip every element in some subset of the array
    // Complexity: 
    if (!shuffling){
        await pancakeSort();
    }
}

async function bogoSortEntry(){
    // This sort works by finding which of the remaining elements should come next and placing it in the correct position
    // Complexity: n!
    if (!runBogo && !shuffling){
        await bogoSort();
    }
    else{
        runBogo = false;
    }
}

async function decideSortEntry() {
    if (!shuffling){
        shuffling = true;
        await greenPass();
        shuffling = false;
    }
}

async function mergeSortEntry(){
    // This sort works by dividing the list into smaller lists, ordering the smaller lists, then merging the two lists together
    // Complexity: n log(n)

    if (!shuffling){
        shuffling = true;
        barArray = await mergeSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function quickSortEntry(){
    // This sort arranges all elements as being either greater than or less than a selected pivot
    // Complexity: n log(n)
    if (!shuffling){
        shuffling = true;
        barArray = await quickSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function heapSortEntry(){
    // This sort uses ordered trees (heaps) to reduce the number of comparisons needed to sort the list
    // Complexity: n log(n)
    if (!shuffling){
        shuffling = true;
        barArray = await heapSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function oddEvenSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await oddEvenSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function radixSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await radixSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function bitonicSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await bitonicSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function iCantBelieveItCanSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await iCantBelieveItCanSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function greenPass(){
    for (let index = 0; index < (barArray.length - 1); index++){
        barArray[index].SetColor(2);
        barArray[index + 1].SetColor(2);
        playBleep(barArray[index].value);
        await drawBars();
        await sleep();
    }
    await drawBars();
}

createBars();

// Resizes the canvas when the window is resized
window.onload = window.onresize = function() {
    var canvas = document.getElementById("AlgorithmCanvas");
    canvas.width = window.innerWidth * 0.91;
    canvas.height = window.innerHeight * 0.64;
    adjustBarSize();
    drawBars();     
}

async function swapIndexes(array = barArray, index1, index2, trueStartIndex = 0) {
    temp = array[index2];
    array[index2] = array[index1];
    array[index1] = temp;

    array[index1].SetIndex(index1 + trueStartIndex);
    array[index2].SetIndex(index2 + trueStartIndex);

    // Visuals

    array[index1].SetColor(1);
    array[index2].SetColor(1);

    await playBleep(array[index1].value);
    await drawBars();
    await sleep();
    array[index1].SetColor(0);
    array[index2].SetColor(0);

    return array;
}

/*async function correctOrderComparison(array, index1, index2){
    array[index1].SetColor(2);
    array[index2].SetColor(2);
    await playBleep(array[index1].value);
    await drawBars();
    await sleep();
    array[index1].SetColor(0);
    array[index2].SetColor(0);
}*/
