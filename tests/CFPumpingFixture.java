import java.util.*;
import java.lang.reflect.*;
import pumping.*;

/** Controlled replay of the supplied JFLAP 7.1 context-free opponent methods.
 * Only LemmaMath's random source is replaced, by a deterministic fractional source.
 * No original method bodies or model fields are changed.
 */
public class CFPumpingFixture {
 static final String[] IDS={"AnBnCF","AnBnCn","AkBnCnDj","AnBjAnBj","AiBjCk","NagNbeNc","NaNbNc","WW","WW1WrEquals","WW1WrGrtrThanEq","W1BnW2","W1CW2CW3CW4","W1VVrW2"};
 static final double[] FRACTIONS={0,0.49,0.99};
 static Field random;
 static List<String> records=new ArrayList<String>();
 static class FractionRandom extends Random {
  final double fraction;
  FractionRandom(double fraction){this.fraction=fraction;}
  public int nextInt(int bound){return (int)Math.floor(fraction*bound);}
  public boolean nextBoolean(){return fraction<0.5;}
 }
 static void rng(double fraction)throws Exception {random.set(null,new FractionRandom(fraction));}
 static ContextFreePumpingLemma model(String id)throws Exception{return (ContextFreePumpingLemma)Class.forName("pumping.cf."+(id.equals("AnBnCF")?"AnBn":id)).newInstance();}
 static String q(String s){if(s==null)return "null";StringBuilder b=new StringBuilder("\"");for(char c:s.toCharArray()){if(c=='\\'||c=='\"')b.append('\\').append(c);else if(c=='\n')b.append("\\n");else if(c=='\r')b.append("\\r");else if(c=='\t')b.append("\\t");else if(c<32)b.append(String.format("\\u%04x",(int)c));else b.append(c);}return b.append('"').toString();}
 static String parts(ContextFreePumpingLemma p){return "["+q(p.getU())+","+q(p.getV())+","+q(p.getX())+","+q(p.getY())+","+q(p.getZ())+"]";}
 static String head(String id,String kind,int m,double fraction){return "{\"id\":"+q(id)+",\"kind\":"+q(kind)+",\"m\":"+m+",\"random\":"+fraction;}
 static void split(String id,int m,String word,double fraction)throws Exception{
  ContextFreePumpingLemma p=model(id);p.setM(m);p.setW(word);rng(fraction);
  String prefix=head(id,"split",m,fraction)+",\"word\":"+q(word)+",\"belongs\":"+p.isInLang(word);
  try{p.chooseDecomposition();boolean valid=(p.getU()+p.getV()+p.getX()+p.getY()+p.getZ()).equals(word)&&p.getV().length()+p.getY().length()>0&&p.getV().length()+p.getX().length()+p.getY().length()<=m;records.add(prefix+",\"parts\":"+parts(p)+",\"valid\":"+valid+"}");}
  catch(RuntimeException e){records.add(prefix+",\"error\":"+q(e.getClass().getSimpleName())+"}");}
 }
 public static void main(String[] args)throws Exception{
  random=LemmaMath.class.getDeclaredField("RAND_GENERATOR");random.setAccessible(true);
  for(String id:IDS){
   ContextFreePumpingLemma initial=model(id);int[] range=initial.getRange();
   records.add("{\"id\":"+q(id)+",\"kind\":\"range\",\"range\":"+Arrays.toString(range)+"}");
   for(double fraction:FRACTIONS){rng(fraction);initial.chooseM();records.add(head(id,"length",0,fraction)+",\"value\":"+initial.getM()+"}");}
   LinkedHashSet<String> custom=new LinkedHashSet<String>();
   for(int m=range[0];m<=range[1];m++)for(double fraction:FRACTIONS){
    ContextFreePumpingLemma p=model(id);rng(fraction);p.setM(m);String w=p.getW();
    records.add(head(id,"word",m,fraction)+",\"value\":"+q(w)+",\"belongs\":"+p.isInLang(w)+"}");
    if(m==range[0]||m==range[0]+1||m==range[1]){
     for(double choice:FRACTIONS)split(id,m,w,choice);
     // Deterministic boundary/stratified legal decompositions. Include every
     // one-symbol pump position and sample wider windows, rather than exponential all-splits.
     LinkedHashSet<String> seen=new LinkedHashSet<String>();
     ArrayList<int[]> decompositions=new ArrayList<int[]>();
     for(int u=0;u<w.length();u++)for(int side=0;side<2;side++)decompositions.add(new int[]{u,side,0,1-side});
     int[] sizes={0,1,2,m/2,m-1,m};
     for(int u=0;u<w.length();u++)for(int v:sizes)for(int x:sizes)for(int y:sizes){
      if(v+y==0||v+x+y>m||u+v+x+y>w.length())continue;
      if(u!=0&&u+v+x+y!=w.length()&&(u*7+v*11+x*13+y*17)%37!=0)continue;
      decompositions.add(new int[]{u,v,x,y});
     }
     for(int[] d:decompositions){
      if(!seen.add(Arrays.toString(d)))continue;
      for(double choice:FRACTIONS){
       if(!p.setDecomposition(d))throw new IllegalStateException("Generated invalid split");rng(choice);
       String prefix=head(id,"exponent",m,choice)+",\"word\":"+q(w)+",\"parts\":"+parts(p);
       try{p.chooseI();records.add(prefix+",\"value\":"+p.getI()+",\"belongs\":"+p.isInLang(p.createPumpedString())+"}");}
       catch(RuntimeException e){records.add(prefix+",\"error\":"+q(e.getClass().getSimpleName())+"}");}
      }
     }
    }
   }
   // Accepted short words broaden computer-split branch coverage beyond chooseW.
   int m=range[0];
   for(int len=m;len<=Math.max(7,m);len++){
    if(len>12)break;
    for(int bits=0;bits<(1<<len);bits++){
     StringBuilder word=new StringBuilder();for(int k=0;k<len;k++)word.append((bits&(1<<k))==0?'a':'b');
     String w=word.toString();if(initial.isInLang(w))custom.add(w);
     if(custom.size()>=24)break;
    }
    if(custom.size()>=24)break;
   }
   for(String w:custom)for(double fraction:FRACTIONS)split(id,m,w,fraction);
  }
  for(String word:new String[]{"acacbcb","acbcacb","acbcbca","acacbca","acbcaca","ccc","acacac","acacacac","acacaca","acacacaccc","cacaca","acacac"}){
   ContextFreePumpingLemma p=model("W1CW2CW3CW4");records.add("{\"id\":\"W1CW2CW3CW4\",\"kind\":\"membership\",\"word\":"+q(word)+",\"belongs\":"+p.isInLang(word)+"}");
  }
  System.out.println("{\"jarSha256\":\"a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406\",\"randomPolicy\":\"nextInt(bound)=floor(fraction*bound); nextBoolean=fraction<0.5\",\"records\":[\n"+String.join(",\n",new LinkedHashSet<String>(records))+"\n]}");
 }
}
