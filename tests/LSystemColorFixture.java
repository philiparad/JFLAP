import java.awt.Color;
import java.lang.reflect.*;
import java.util.*;

/** Read-only invocation of JFLAP 7.1 Turtle.colorForString. */
public class LSystemColorFixture {
 static String q(String s){return "\""+s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\t","\\t")+"\"";}
 public static void main(String[] args)throws Exception{
  Class<?> turtle=Class.forName("gui.lsystem.Turtle");Method parse=turtle.getDeclaredMethod("colorForString",String.class);parse.setAccessible(true);
  Field palette=turtle.getDeclaredField("COLORS");palette.setAccessible(true);
  TreeSet<String> names=new TreeSet<String>();names.addAll(((Map<String,Color>)palette.get(null)).keySet());
  for(Field field:Color.class.getFields())if(field.getType()==Color.class)names.add(field.getName());
  LinkedHashSet<String> inputs=new LinkedHashSet<String>(names);
  Collections.addAll(inputs,"dukeBlue","dukeblue","DukeBlue","forestGreen","forestgreen"," lightGray","red ","Red","RED","#ff0000","rgb(255,0,0)","",",",",,", "0,0", "0,0,0", "1,1,1", "0,1,1", "0.5,1,1", "1,0.5,0.5", "0.25,0.75,0.6", "0,0,0.5", "0.999,0.999,0.999", "1.00001,1,1", "255,128,0", "12.9,34.9,56.9", " 255 , 128 , 0 ", "1e2,2e1,3e0", "-1,0,0", "256,0,0", "NaN,0,0", "Infinity,0,0", "0,0,NaN", "0,0,1,255", ",0,,1,1,", "0;1;1", "1 1 1", "0.5f,1f,1f", "0x1.0p-1,1,1", "0.5,1,1,garbage", "OPAQUE", "+255,+128,+0", "-0.0,0,0", "0.5D,1D,1D", "1e-1F,1f,1F", "NaN,255,0", "0x1.8p+7,0,0", "1e999,0,0", "1e-999,0,0", "1,2,3,4", "1,,2,,3", "1, ,2,3");
  Random random=new Random(53);for(int i=0;i<120;i++)inputs.add(random.nextFloat()+","+random.nextFloat()+","+random.nextFloat());
  for(int i=0;i<40;i++)inputs.add((random.nextFloat()*255)+","+(random.nextFloat()*255)+","+(random.nextFloat()*255));
  System.out.print("{\"jarSha256\":\"a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406\",\"palette\":[");boolean first=true;
  for(String name:names){if(!first)System.out.print(",");first=false;System.out.print(q(name));}System.out.println("],\"records\":[");first=true;
  for(String input:inputs){if(!first)System.out.println(",");first=false;System.out.print("{\"input\":"+q(input)+",");try{Color c=(Color)parse.invoke(null,input);System.out.print("\"rgb\":"+(c==null?"null":"["+c.getRed()+","+c.getGreen()+","+c.getBlue()+"]"));}catch(InvocationTargetException e){System.out.print("\"error\":"+q(e.getCause().getClass().getSimpleName()));}System.out.print("}");}
  System.out.println("\n]}");
 }
}
