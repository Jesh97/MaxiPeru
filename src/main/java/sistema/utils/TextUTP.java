package sistema.utils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

public class TextUTP {

    public static String read(String filename) throws IOException {
        try(BufferedInputStream in = new BufferedInputStream(
                new FileInputStream(filename))
        ){
            String data = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            return data;
        } catch (IOException e) {
            throw e;
        }
    }

    public static List<String> readlines(String filename) throws IOException {
        String data = read(filename);
        List<String> res = new LinkedList<>();
        if (data.length() > 0){
            res = Arrays.asList(data.split("\n"));
        }
        return res;
    }

    public static String[] readlinesAsArray(String filename) throws IOException {
        String data = read(filename);
        String[] res = new String[]{};
        if (data.length() > 0){
            res = data.split("\n");
        }
        return res;
    }

    private static void writeText(byte[] data, String filename)
            throws IOException{
        try(BufferedOutputStream out = new BufferedOutputStream(
                new FileOutputStream(filename,true))
        ){
            out.write(data);
        } catch (IOException e) {
            throw e;
        }
    }

    public static void append(String data, String filename) throws IOException {
        writeText(data.getBytes(), filename);
    }

    public static void append(String[] data, String filename, boolean withNewLine) throws IOException {
        StringBuilder sb = new StringBuilder();
        for (String item : data) {
            if (withNewLine == true) {
                sb.append(item + "\n");
            }else{
                sb.append(item);
            }
        }
        writeText(sb.toString().getBytes(), filename);
    }

    public static void append(String[] data, String filename) throws IOException {
        append(data, filename, true);
    }

    public static void append(List<String> data, String filename, boolean withNewLine) throws IOException {
        StringBuilder sb = new StringBuilder();
        for (String item : data) {
            if (withNewLine == true) {
                sb.append(item + "\n");
            }else{
                sb.append(item);
            }
        }
        writeText(sb.toString().getBytes(), filename);
    }

    public static void append(List<String> data, String filename) throws IOException {
        append(data, filename, true);
    }

}
